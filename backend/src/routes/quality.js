import { Router } from 'express';
import { queryOne, run } from '../db/database.js';
import { evaluateQuality } from '../services/qualityEngine.js';
import { initializeStageHistory } from '../services/paymentEngine.js';

const router = Router();

/**
 * POST /api/quality-checks
 * Records moisture, foreign matter, and weighbridge weights.
 * Evaluates 3-outcome MSP domain logic (Pass, Discount, Fail Rejection).
 */
router.post('/', (req, res) => {
  try {
    const {
      slot_booking_id,
      token_id,
      moisture_pct,
      foreign_matter_pct = 0.5,
      gross_weight_kg,
      tare_weight_kg
    } = req.body;

    // Lookup slot booking
    const booking = queryOne(`
      SELECT sb.*, r.season_config_id, f.name as farmer_name, f.id as farmer_id, f.phone
      FROM slot_bookings sb
      JOIN registrations r ON sb.registration_id = r.id
      JOIN farmers f ON sb.farmer_id = f.id
      WHERE sb.id = ? OR sb.token_number = ?
    `, [slot_booking_id || token_id, token_id || slot_booking_id]);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Slot booking token not found' });
    }

    // Lookup active season config
    const seasonConfig = queryOne('SELECT * FROM season_configs WHERE id = ?', [booking.season_config_id]);
    if (!seasonConfig) {
      return res.status(404).json({ success: false, message: 'Season configuration not found' });
    }

    // Execute 3-Tier Quality Evaluation
    const evaluation = evaluateQuality({
      moisturePct: moisture_pct,
      foreignMatterPct: foreign_matter_pct,
      grossWeightKg: gross_weight_kg,
      tareWeightKg: tare_weight_kg,
      seasonConfig
    });

    const qcId = `QC-${Date.now().toString().slice(-6)}`;
    const receiptNo = `JFORM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert or Replace Quality Check
    run(`
      INSERT OR REPLACE INTO quality_checks (
        id, slot_booking_id, moisture_pct, foreign_matter_pct, outcome, base_msp_rate,
        discount_amount_per_unit, final_price_per_unit, gross_weight_kg, tare_weight_kg,
        accepted_quantity, total_payout, quality_grade, receipt_no, notes, checked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      qcId, booking.id, parseFloat(moisture_pct), parseFloat(foreign_matter_pct),
      evaluation.outcome, evaluation.baseMspRate, evaluation.discountAmountPerUnit,
      evaluation.finalPricePerUnit, parseFloat(gross_weight_kg), parseFloat(tare_weight_kg),
      evaluation.acceptedQuantityQuintals, evaluation.totalPayout, evaluation.qualityGrade,
      receiptNo, evaluation.notes, new Date().toISOString()
    ]);

    // Handle Outcome State Transitions
    if (evaluation.outcome === 'FAIL') {
      // Terminal Rejection
      run(`
        UPDATE slot_bookings 
        SET status = 'REJECTED', current_step_index = 1 
        WHERE id = ?
      `, [booking.id]);

      const smsId = `sms-${Date.now()}`;
      const smsMsg = `FasalExpress Rejection Alert: Crop rejected at Mandi Quality Lab. Reason: ${evaluation.notes}`;
      run(`
        INSERT INTO notifications (id, farmer_id, channel, type, title, message, sent_at)
        VALUES (?, ?, 'sms', 'QUALITY_REJECTION', '❌ Produce Rejected', ?, ?)
      `, [smsId, booking.farmer_id, smsMsg, new Date().toISOString()]);

      return res.status(200).json({
        success: true,
        outcome: 'FAIL',
        message: 'Produce rejected: Exceeds APMC quality ceiling.',
        evaluation: {
          ...evaluation,
          receiptNo
        }
      });
    }

    // Pass or Marginal Discount -> Advances to weighbridge matched & initializes payment status
    run(`
      UPDATE slot_bookings 
      SET status = 'WEIGHED', current_step_index = 2 
      WHERE id = ?
    `, [booking.id]);

    // Initialize 6-stage Payment Pipeline
    const payId = `PAY-${Date.now().toString().slice(-6)}`;
    const stageHistory = initializeStageHistory('quality_verified');
    const dbtRef = `DBT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    run(`
      INSERT OR REPLACE INTO payment_statuses (
        id, quality_check_id, slot_booking_id, farmer_id, amount, current_stage,
        stage_history, receipt_no, dbt_ref, settlement_date, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'quality_verified', ?, ?, ?, ?, ?)
    `, [
      payId, qcId, booking.id, booking.farmer_id, evaluation.totalPayout,
      JSON.stringify(stageHistory), receiptNo, dbtRef,
      new Date().toISOString().split('T')[0], new Date().toISOString()
    ]);

    // Send SMS alert with pricing details
    const smsId = `sms-${Date.now()}`;
    const smsMsg = evaluation.outcome === 'DISCOUNT'
      ? `FasalExpress: Quality Checked (FAQ). Moisture: ${moisture_pct}%. Deduction: Rs.${evaluation.discountAmountPerUnit}/Qt. Final Rate: Rs.${evaluation.finalPricePerUnit}/Qt. Total: Rs.${evaluation.totalPayout.toLocaleString('en-IN')}. Receipt #${receiptNo}.`
      : `FasalExpress: Quality Verified (Grade A). Full MSP Rate: Rs.${evaluation.finalPricePerUnit}/Qt. Total Payout: Rs.${evaluation.totalPayout.toLocaleString('en-IN')}. J-Form #${receiptNo}.`;

    run(`
      INSERT INTO notifications (id, farmer_id, channel, type, title, message, sent_at)
      VALUES (?, ?, 'sms', 'QUALITY_RESULT', '🌾 Quality Tested & Approved', ?, ?)
    `, [smsId, booking.farmer_id, smsMsg, new Date().toISOString()]);

    res.status(201).json({
      success: true,
      outcome: evaluation.outcome,
      message: evaluation.notes,
      evaluation: {
        ...evaluation,
        receiptNo,
        dbtRef
      },
      weighbridgeSlip: {
        receiptNo,
        grossWeightKg: parseFloat(gross_weight_kg),
        tareWeightKg: parseFloat(tare_weight_kg),
        netWeightKg: evaluation.netWeightKg,
        netWeightQuintals: evaluation.acceptedQuantityQuintals,
        moisturePercent: `${moisture_pct}%`,
        qualityGrade: evaluation.qualityGrade,
        ratePerQuintal: evaluation.finalPricePerUnit,
        totalNetValue: evaluation.totalPayout
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/quality-checks/:slotBookingId
 */
router.get('/:slotBookingId', (req, res) => {
  try {
    const qc = queryOne(`
      SELECT qc.*, sb.token_number 
      FROM quality_checks qc
      JOIN slot_bookings sb ON qc.slot_booking_id = sb.id
      WHERE qc.slot_booking_id = ? OR sb.token_number = ?
    `, [req.params.slotBookingId, req.params.slotBookingId]);

    if (!qc) {
      return res.status(404).json({ success: false, message: 'Quality check record not found' });
    }

    res.json({ success: true, data: qc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
