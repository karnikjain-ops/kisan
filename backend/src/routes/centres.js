import { Router } from 'express';
import { queryAll, queryOne, run } from '../db/database.js';
import { getLiveYardBreakdown, calculateEstimatedWait } from '../services/queueEngine.js';

const router = Router();

/**
 * GET /api/centres
 * List all procurement centres with live booking capacity
 */
router.get('/', (req, res) => {
  try {
    const centres = queryAll('SELECT * FROM procurement_centres ORDER BY id ASC');

    const mapped = centres.map(c => {
      // Calculate booked quintals today
      const today = new Date().toISOString().split('T')[0];
      const booked = queryOne(`
        SELECT COALESCE(SUM(quantity_quintals), 0) as total
        FROM slot_bookings
        WHERE centre_id = ? AND booked_date = ? AND status != 'CANCELLED'
      `, [c.id, today]);

      // Seed baseline for demo realism
      const baseBooked = c.id === 'mandi-1' ? 3450 : c.id === 'mandi-2' ? 1900 : 5800;
      const totalBooked = baseBooked + (booked?.total || 0);

      return {
        id: c.id,
        name: c.name,
        district: c.district,
        state: c.state,
        distanceKm: c.id === 'mandi-1' ? 12 : c.id === 'mandi-2' ? 24 : 38,
        dailyCapacityQuintals: c.capacity_per_day,
        currentBookedQuintals: totalBooked,
        activeCounters: c.active_counters,
        avgProcessingTimeMins: c.avg_processing_time_mins,
        status: c.status,
        gatePaused: Boolean(c.gate_paused),
        lat: c.lat,
        lng: c.lng,
        gatePhone: c.gate_phone,
        assignedZones: JSON.parse(c.assigned_zone_ids)
      };
    });

    res.json({ success: true, count: mapped.length, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/centres/:id/queue
 * Live queue position + estimated wait + yard stage breakdown (Differentiator #1)
 */
router.get('/:id/queue', (req, res) => {
  try {
    const centreId = req.params.id;
    const centre = queryOne('SELECT * FROM procurement_centres WHERE id = ?', [centreId]);
    if (!centre) {
      return res.status(404).json({ success: false, message: 'Procurement centre not found' });
    }

    const activeBookings = queryAll(`
      SELECT sb.*, f.name as farmer_name, f.phone as farmer_phone
      FROM slot_bookings sb
      JOIN farmers f ON sb.farmer_id = f.id
      WHERE sb.centre_id = ? AND sb.status IN ('BOOKED', 'CHECKED_IN', 'IN_PROGRESS', 'WEIGHED')
      ORDER BY sb.queue_position ASC, sb.created_at ASC
    `, [centreId]);

    const yardBreakdown = getLiveYardBreakdown(centreId);

    const servingTicket = activeBookings.find(b => b.status === 'IN_PROGRESS' || b.queue_position === 1) || activeBookings[0];

    const formattedQueue = activeBookings.map((b, idx) => ({
      tokenId: b.token_number,
      farmerName: b.farmer_name,
      phone: b.farmer_phone,
      queuePosition: b.queue_position || idx + 1,
      estimatedWaitMins: calculateEstimatedWait(b.queue_position || idx + 1, centre.avg_processing_time_mins, centre.active_counters),
      counterNo: b.counter_no,
      status: b.status,
      currentStepIndex: b.current_step_index,
      timeWindow: b.time_window,
      staggeredGateTime: b.staggered_gate_time
    }));

    res.json({
      success: true,
      centre: {
        id: centre.id,
        name: centre.name,
        district: centre.district,
        activeCounters: centre.active_counters,
        avgProcessingTimeMins: centre.avg_processing_time_mins,
        gatePaused: Boolean(centre.gate_paused)
      },
      currentlyServing: servingTicket ? {
        tokenId: servingTicket.token_number,
        counterNo: servingTicket.counter_no,
        status: servingTicket.status
      } : { tokenId: '#KQ-404', counterNo: 'Counter #3', status: 'IN_PROGRESS' },
      yardBreakdown,
      queue: formattedQueue
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/centres/:id/process-arrival
 * Staff-facing: marks token as arrived at gate, initiates quality check
 */
router.post('/:id/process-arrival', (req, res) => {
  try {
    const { token_id } = req.body;
    if (!token_id) {
      return res.status(400).json({ success: false, message: 'token_id is required' });
    }

    const booking = queryOne(`
      SELECT * FROM slot_bookings WHERE token_number = ? OR id = ?
    `, [token_id, token_id]);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    run(`
      UPDATE slot_bookings 
      SET status = 'CHECKED_IN', current_step_index = 1 
      WHERE id = ?
    `, [booking.id]);

    // Send SMS alert
    const smsId = `sms-${Date.now()}`;
    const smsMsg = `FasalExpress Alert: Token #${booking.token_number} checked in at Gate 1. Proceed to Quality Inspection Bay 2.`;
    run(`
      INSERT INTO notifications (id, farmer_id, channel, type, title, message, sent_at)
      VALUES (?, ?, 'sms', 'GATE_ENTRY', '🚪 Gate Entry Recorded', ?, ?)
    `, [smsId, booking.farmer_id, smsMsg, new Date().toISOString()]);

    res.json({
      success: true,
      message: `Token #${booking.token_number} arrived and checked in successfully`,
      status: 'CHECKED_IN',
      currentStepIndex: 1
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/centres/:id/advance-queue
 * Staff-facing: advances live queue positions and current stage
 */
router.post('/:id/advance-queue', (req, res) => {
  try {
    const centreId = req.params.id;
    const activeBookings = queryAll(`
      SELECT * FROM slot_bookings 
      WHERE centre_id = ? AND status IN ('BOOKED', 'CHECKED_IN', 'IN_PROGRESS', 'WEIGHED')
      ORDER BY queue_position ASC
    `, [centreId]);

    if (activeBookings.length === 0) {
      return res.json({ success: true, message: 'No active tickets in queue' });
    }

    const first = activeBookings[0];
    const nextStepIndex = (first.current_step_index + 1) % 4;
    const nextStatus = nextStepIndex === 0 ? 'CHECKED_IN' : nextStepIndex === 1 ? 'IN_PROGRESS' : nextStepIndex === 2 ? 'WEIGHED' : 'COMPLETED';

    run(`
      UPDATE slot_bookings 
      SET current_step_index = ?, status = ?
      WHERE id = ?
    `, [nextStepIndex, nextStatus, first.id]);

    // Advance queue positions for the rest
    for (let i = 1; i < activeBookings.length; i++) {
      const b = activeBookings[i];
      const newPos = Math.max(1, b.queue_position - 1);
      run('UPDATE slot_bookings SET queue_position = ? WHERE id = ?', [newPos, b.id]);
    }

    // Trigger alert
    const smsId = `sms-${Date.now()}`;
    const smsMsg = `FasalExpress Alert: Queue counter advanced. Token #${first.token_number} is now at Stage ${nextStepIndex + 1}/4.`;
    run(`
      INSERT INTO notifications (id, farmer_id, channel, type, title, message, sent_at)
      VALUES (?, ?, 'sms', 'QUEUE_ADVANCE', '⏱️ Queue Advance Alert', ?, ?)
    `, [smsId, first.farmer_id, smsMsg, new Date().toISOString()]);

    res.json({
      success: true,
      message: 'Queue advanced successfully',
      currentServingToken: first.token_number,
      nextStepIndex,
      nextStatus
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/centres/:id/pause-gate & resume-gate
 */
router.post('/:id/pause-gate', (req, res) => {
  try {
    const centreId = req.params.id;
    run('UPDATE procurement_centres SET gate_paused = 1 WHERE id = ?', [centreId]);

    res.json({
      success: true,
      message: 'Gate flow paused to manage internal yard traffic.',
      gatePaused: true
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/resume-gate', (req, res) => {
  try {
    const centreId = req.params.id;
    run('UPDATE procurement_centres SET gate_paused = 0 WHERE id = ?', [centreId]);

    res.json({
      success: true,
      message: 'Gate flow resumed.',
      gatePaused: false
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
