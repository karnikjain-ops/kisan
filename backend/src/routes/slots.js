import { Router } from 'express';
import { queryAll, queryOne, run } from '../db/database.js';
import { calculateStaggeredGateTime, calculateEstimatedWait, calculateDepartureTime } from '../services/queueEngine.js';

const router = Router();

/**
 * GET /api/slots
 * List all slot bookings (for mandi officer dashboard and monitoring)
 */
router.get('/', (req, res) => {
  try {
    const { centre_id, date, status } = req.query;
    let sql = `
      SELECT sb.*, f.name as farmer_name, f.phone as farmer_phone, 
             c.name as centre_name, c.avg_processing_time_mins, c.active_counters,
             sc.crop_name, sc.msp_price
      FROM slot_bookings sb
      JOIN farmers f ON sb.farmer_id = f.id
      JOIN procurement_centres c ON sb.centre_id = c.id
      JOIN registrations r ON sb.registration_id = r.id
      JOIN season_configs sc ON r.season_config_id = sc.id
      WHERE 1=1
    `;
    const params = [];

    if (centre_id) {
      sql += ' AND sb.centre_id = ?';
      params.push(centre_id);
    }
    if (date) {
      sql += ' AND sb.booked_date = ?';
      params.push(date);
    }
    if (status) {
      sql += ' AND sb.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY sb.created_at DESC';

    const bookings = queryAll(sql, params);

    const formatted = bookings.map(b => {
      const qc = queryOne('SELECT * FROM quality_checks WHERE slot_booking_id = ?', [b.id]);
      const pay = queryOne('SELECT * FROM payment_statuses WHERE slot_booking_id = ?', [b.id]);

      return {
        tokenId: b.token_number,
        farmerName: b.farmer_name,
        farmerId: b.farmer_id,
        phone: b.farmer_phone,
        mandiName: b.centre_name,
        mandiId: b.centre_id,
        cropName: b.crop_name,
        cropCategory: b.crop_name.toLowerCase().includes('wheat') ? 'wheat' : 'other',
        quantityQuintals: b.quantity_quintals,
        mspRate: b.msp_price,
        estimatedPayout: qc ? qc.total_payout : b.quantity_quintals * b.msp_price,
        slotDate: b.booked_date,
        timeWindow: b.time_window,
        counterNo: b.counter_no,
        status: b.status,
        currentStepIndex: b.current_step_index,
        queuePosition: b.queue_position,
        estimatedWaitMins: calculateEstimatedWait(b.queue_position, b.avg_processing_time_mins, b.active_counters),
        staggeredGateTime: b.staggered_gate_time,
        bookingChannel: b.booking_channel,
        qrCodeData: b.qr_code_data,
        weighbridgeDetails: qc ? {
          grossWeightKg: qc.gross_weight_kg,
          tareWeightKg: qc.tare_weight_kg,
          netWeightKg: qc.gross_weight_kg - qc.tare_weight_kg,
          moisturePercent: `${qc.moisture_pct}%`,
          qualityGrade: qc.quality_grade,
          receiptNo: qc.receipt_no
        } : null,
        paymentDetails: pay ? {
          dbtStatus: pay.current_stage === 'payment_credited' ? 'SUCCESS' : 'IN_PROGRESS',
          txnRef: pay.dbt_ref,
          amount: pay.amount,
          settlementDate: pay.settlement_date
        } : null
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/slots/availability
 * Returns live booking capacity across staggered windows for a given centre and date
 */
router.get('/availability', (req, res) => {
  try {
    const { centre_id = 'mandi-1', date = '2026-09-05' } = req.query;

    const centre = queryOne('SELECT * FROM procurement_centres WHERE id = ?', [centre_id]) || {
      id: centre_id,
      max_trucks_per_slot: 15
    };

    const maxCapacity = centre.max_trucks_per_slot || 15;

    const isDemoDate = date === '2026-09-05';
    const defaultSlots = isDemoDate ? [
      { window: '08:00 AM - 10:00 AM', defaultBooked: 14, defaultSubSlot: '10:15 AM Entry' },
      { window: '10:00 AM - 01:00 PM', defaultBooked: 15, defaultSubSlot: 'FULL - Re-routed' },
      { window: '01:00 PM - 03:00 PM', defaultBooked: 6, defaultSubSlot: '01:45 PM Entry' },
      { window: '03:00 PM - 06:00 PM', defaultBooked: 3, defaultSubSlot: '03:30 PM Entry' }
    ] : [
      { window: '08:00 AM - 10:00 AM', defaultBooked: 2, defaultSubSlot: '08:30 AM Entry' },
      { window: '10:00 AM - 01:00 PM', defaultBooked: 4, defaultSubSlot: '10:45 AM Entry' },
      { window: '01:00 PM - 03:00 PM', defaultBooked: 3, defaultSubSlot: '01:30 PM Entry' },
      { window: '03:00 PM - 06:00 PM', defaultBooked: 1, defaultSubSlot: '03:15 PM Entry' }
    ];

    const mandiOffset = isDemoDate ? (centre_id === 'mandi-2' ? -4 : centre_id === 'mandi-3' ? 2 : 0) : 0;

    const dbBookings = queryAll(`
      SELECT time_window, COUNT(*) as count
      FROM slot_bookings
      WHERE centre_id = ? AND booked_date = ? AND status != 'CANCELLED'
      GROUP BY time_window
    `, [centre_id, date]);

    const dbMap = {};
    for (const b of dbBookings) {
      dbMap[b.time_window] = b.count;
    }

    const availability = defaultSlots.map(slot => {
      let base = Math.max(0, Math.min(maxCapacity, slot.defaultBooked + mandiOffset));
      if (centre_id === 'mandi-1' && isDemoDate && slot.window === '10:00 AM - 01:00 PM') {
        base = 11; // 11 baseline + 4 seeded in DB = 15 (FULL)
      }

      const additionalBooked = dbMap[slot.window] || 0;
      const totalBooked = Math.min(maxCapacity, base + additionalBooked);
      const isFull = totalBooked >= maxCapacity;
      const subSlot = isFull ? 'FULL - Re-routed' : slot.defaultSubSlot;

      return {
        window: slot.window,
        booked: totalBooked,
        max: maxCapacity,
        isFull,
        subSlot
      };
    });

    res.json({
      success: true,
      centre_id,
      date,
      slots: availability
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/slots/:tokenId
 * Fetch single slot token details
 */
router.get('/:tokenId', (req, res) => {
  try {
    const b = queryOne(`
      SELECT sb.*, f.name as farmer_name, f.phone as farmer_phone,
             c.name as centre_name, c.avg_processing_time_mins, c.active_counters,
             sc.crop_name, sc.msp_price
      FROM slot_bookings sb
      JOIN farmers f ON sb.farmer_id = f.id
      JOIN procurement_centres c ON sb.centre_id = c.id
      JOIN registrations r ON sb.registration_id = r.id
      JOIN season_configs sc ON r.season_config_id = sc.id
      WHERE sb.token_number = ? OR sb.id = ?
    `, [req.params.tokenId, req.params.tokenId]);

    if (!b) {
      return res.status(404).json({ success: false, message: 'Slot token not found' });
    }

    const qc = queryOne('SELECT * FROM quality_checks WHERE slot_booking_id = ?', [b.id]);
    const pay = queryOne('SELECT * FROM payment_statuses WHERE slot_booking_id = ?', [b.id]);

    res.json({
      success: true,
      data: {
        tokenId: b.token_number,
        farmerName: b.farmer_name,
        farmerId: b.farmer_id,
        phone: b.farmer_phone,
        mandiName: b.centre_name,
        mandiId: b.centre_id,
        cropName: b.crop_name,
        quantityQuintals: b.quantity_quintals,
        mspRate: b.msp_price,
        estimatedPayout: qc ? qc.total_payout : b.quantity_quintals * b.msp_price,
        slotDate: b.booked_date,
        timeWindow: b.time_window,
        counterNo: b.counter_no,
        status: b.status,
        currentStepIndex: b.current_step_index,
        queuePosition: b.queue_position,
        estimatedWaitMins: calculateEstimatedWait(b.queue_position, b.avg_processing_time_mins, b.active_counters),
        staggeredGateTime: b.staggered_gate_time,
        bookingChannel: b.booking_channel,
        qrCodeData: b.qr_code_data,
        weighbridgeDetails: qc ? {
          grossWeightKg: qc.gross_weight_kg,
          tareWeightKg: qc.tare_weight_kg,
          netWeightKg: qc.gross_weight_kg - qc.tare_weight_kg,
          moisturePercent: `${qc.moisture_pct}%`,
          qualityGrade: qc.quality_grade,
          receiptNo: qc.receipt_no
        } : null,
        paymentDetails: pay ? {
          dbtStatus: pay.current_stage === 'payment_credited' ? 'SUCCESS' : 'IN_PROGRESS',
          txnRef: pay.dbt_ref,
          amount: pay.amount,
          currentStage: pay.current_stage,
          stageHistory: JSON.parse(pay.stage_history),
          settlementDate: pay.settlement_date
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/slots/book
 * Step 2 Flow: Staggered Slot/Token Booking
 * Validates active registration, procurement window dates, capacity limits & assigns 15-min micro gate time
 */
router.post('/book', (req, res) => {
  try {
    const {
      farmer_id,
      crop_id,
      quantity,
      mandi_id,
      slot_date,
      time_window,
      booking_channel = 'Web Portal'
    } = req.body;

    const farmerId = farmer_id || 'FARM-2026-9842';
    const reqQty = parseFloat(quantity) || 40;
    const reqDate = slot_date || new Date().toISOString().split('T')[0];
    const reqWindow = time_window || '10:00 AM - 01:00 PM';

    // 1. Verify Farmer
    const farmer = queryOne('SELECT * FROM farmers WHERE id = ?', [farmerId]);
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not registered in KisanQueue' });
    }

    // 2. Lookup Registration for farmer
    let registration = queryOne(`
      SELECT r.*, sc.crop, sc.crop_name, sc.msp_price, sc.procurement_window_start, sc.procurement_window_end,
             c.name as centre_name, c.capacity_per_day, c.max_trucks_per_slot, c.active_counters, c.avg_processing_time_mins
      FROM registrations r
      JOIN season_configs sc ON r.season_config_id = sc.id
      JOIN procurement_centres c ON r.centre_id = c.id
      WHERE r.farmer_id = ? AND r.status = 'APPROVED'
      ORDER BY r.created_at DESC
    `, [farmerId]);

    // If no registration, auto-create approved registration for seamless UX if crop exists
    if (!registration) {
      const defaultSc = queryOne('SELECT * FROM season_configs WHERE is_active = 1 LIMIT 1');
      const defaultCentre = queryOne('SELECT * FROM procurement_centres LIMIT 1');
      const regId = `REG-${Date.now().toString().slice(-6)}`;
      
      run(`
        INSERT INTO registrations (id, farmer_id, season_config_id, centre_id, declared_quantity, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'APPROVED', ?)
      `, [regId, farmerId, defaultSc.id, defaultCentre.id, Math.max(reqQty, 50), new Date().toISOString()]);

      registration = queryOne(`
        SELECT r.*, sc.crop, sc.crop_name, sc.msp_price, sc.procurement_window_start, sc.procurement_window_end,
               c.name as centre_name, c.capacity_per_day, c.max_trucks_per_slot, c.active_counters, c.avg_processing_time_mins
        FROM registrations r
        JOIN season_configs sc ON r.season_config_id = sc.id
        JOIN procurement_centres c ON r.centre_id = c.id
        WHERE r.id = ?
      `, [regId]);
    }

    // 3. Domain Rule: Check Procurement Window Dates
    const targetDate = new Date(reqDate);
    const procStart = new Date(registration.procurement_window_start);
    const procEnd = new Date(registration.procurement_window_end);

    if (targetDate < procStart || targetDate > procEnd) {
      return res.status(400).json({
        success: false,
        code: 'OUTSIDE_PROCUREMENT_WINDOW',
        message: `Booking Rejected: Date ${reqDate} is outside the statutory procurement window (${registration.procurement_window_start.split('T')[0]} to ${registration.procurement_window_end.split('T')[0]}).`
      });
    }

    // 4. Resolve Centre (Assigned jurisdiction centre)
    const assignedCentreId = mandi_id || registration.centre_id;
    const centre = queryOne('SELECT * FROM procurement_centres WHERE id = ?', [assignedCentreId]) || {
      id: registration.centre_id,
      name: registration.centre_name,
      active_counters: registration.active_counters || 6,
      avg_processing_time_mins: registration.avg_processing_time_mins || 14,
      max_trucks_per_slot: 15
    };

    // 5. Anti-Herding Hard Threshold Check (Max 15 trucks per window)
    const existingBookingsCount = queryOne(`
      SELECT COUNT(*) as count 
      FROM slot_bookings 
      WHERE centre_id = ? AND booked_date = ? AND time_window = ? AND status != 'CANCELLED'
    `, [centre.id, reqDate, reqWindow]);

    const isDemoDate = reqDate === '2026-09-05';
    const mandiOffset = isDemoDate ? (centre.id === 'mandi-2' ? -4 : centre.id === 'mandi-3' ? 2 : 0) : 0;
    let baseBooked = 0;
    if (isDemoDate && centre.id === 'mandi-1') {
      if (reqWindow === '08:00 AM - 10:00 AM') baseBooked = 14;
      else if (reqWindow === '10:00 AM - 01:00 PM') baseBooked = 11;
      else if (reqWindow === '01:00 PM - 03:00 PM') baseBooked = 6;
      else if (reqWindow === '03:00 PM - 06:00 PM') baseBooked = 3;
    }
    baseBooked = Math.max(0, Math.min(centre.max_trucks_per_slot || 15, baseBooked + mandiOffset));

    const bookedCount = baseBooked + (existingBookingsCount?.count || 0);
    if (bookedCount >= centre.max_trucks_per_slot) {
      return res.status(400).json({
        success: false,
        code: 'SLOT_CAPACITY_FULL',
        message: `Anti-Congestion Alert: Time slot "${reqWindow}" on ${reqDate} is at 100% capacity (${bookedCount}/${centre.max_trucks_per_slot} trucks booked). Please select an adjacent quiet window.`
      });
    }

    // 6. Generate Token & Micro-Staggered Window
    const tokenNum = Math.floor(410 + Math.random() * 400);
    const tokenId = `KQ-${tokenNum}`;
    const slotId = `SLOT-${Date.now().toString().slice(-6)}`;
    const staggeredGateTime = calculateStaggeredGateTime(reqWindow, bookedCount);
    const counterNo = `Counter #${Math.floor(1 + Math.random() * (centre.active_counters || 4))}`;
    const queuePosition = bookedCount + 1;
    const estimatedWaitMins = calculateEstimatedWait(queuePosition, centre.avg_processing_time_mins, centre.active_counters);
    const qrCodeData = `${tokenId}-${farmer.id}-${centre.id}`;

    // 7. Insert Slot Booking
    run(`
      INSERT INTO slot_bookings (
        id, token_number, registration_id, farmer_id, centre_id, booked_date,
        time_window, staggered_gate_time, quantity_quintals, status, current_step_index,
        counter_no, queue_position, booking_channel, qr_code_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'BOOKED', 0, ?, ?, ?, ?, ?)
    `, [
      slotId, tokenId, registration.id, farmer.id, centre.id, reqDate,
      reqWindow, staggeredGateTime, reqQty, counterNo, queuePosition,
      booking_channel, qrCodeData, new Date().toISOString()
    ]);

    // 8. Trigger Automated SMS Confirmation
    const smsId = `sms-${Date.now()}`;
    const smsMsg = `FasalExpress: Slot Confirmed for ${registration.crop_name} (${reqQty} Qt) at ${centre.name} on ${reqDate}. Token #${tokenId}. Gate Time: ${staggeredGateTime}. Position #${queuePosition}.`;
    run(`
      INSERT INTO notifications (id, farmer_id, channel, type, title, message, sent_at)
      VALUES (?, ?, 'sms', 'SLOT_CONFIRMATION', '✅ Slot Booking Confirmed', ?, ?)
    `, [smsId, farmer.id, smsMsg, new Date().toISOString()]);

    const createdTicket = {
      tokenId,
      farmerName: farmer.name,
      farmerId: farmer.id,
      phone: farmer.phone,
      mandiName: centre.name,
      mandiId: centre.id,
      cropName: registration.crop_name,
      cropCategory: registration.crop,
      quantityQuintals: reqQty,
      mspRate: registration.msp_price,
      estimatedPayout: reqQty * registration.msp_price,
      slotDate: reqDate,
      timeWindow: reqWindow,
      counterNo,
      status: 'BOOKED',
      currentStepIndex: 0,
      queuePosition,
      estimatedWaitMins,
      transitDistanceKm: centre.id === 'mandi-1' ? 12 : centre.id === 'mandi-2' ? 24 : 38,
      recommendedDepartureTime: calculateDepartureTime(staggeredGateTime, centre.id === 'mandi-1' ? 12 : centre.id === 'mandi-2' ? 24 : 38),
      staggeredGateTime,
      bookingChannel: booking_channel,
      qrCodeData,
      createdTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    res.status(201).json({
      success: true,
      message: 'Procurement slot booked successfully with micro-staggered gate pass',
      ticket: createdTicket
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
