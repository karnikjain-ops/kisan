import { Router } from 'express';
import { queryOne, run } from '../db/database.js';
import { advancePaymentStage, PAYMENT_STAGES } from '../services/paymentEngine.js';

const router = Router();

/**
 * GET /api/payments/:id
 */
router.get('/:id', (req, res) => {
  try {
    const pay = queryOne(`
      SELECT p.*, f.name as farmer_name, f.bank_account_mock, f.ifsc_mock,
             sb.token_number, sb.centre_id, c.name as centre_name
      FROM payment_statuses p
      JOIN farmers f ON p.farmer_id = f.id
      JOIN slot_bookings sb ON p.slot_booking_id = sb.id
      JOIN procurement_centres c ON sb.centre_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!pay) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.json({
      success: true,
      data: {
        ...pay,
        stage_history: JSON.parse(pay.stage_history),
        availableStages: PAYMENT_STAGES
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/payments/by-token/:tokenId
 */
router.get('/by-token/:tokenId', (req, res) => {
  try {
    const pay = queryOne(`
      SELECT p.*, f.name as farmer_name, f.bank_account_mock, f.ifsc_mock,
             sb.token_number, sb.centre_id, c.name as centre_name,
             qc.gross_weight_kg, qc.tare_weight_kg, qc.quality_grade, qc.moisture_pct
      FROM payment_statuses p
      JOIN farmers f ON p.farmer_id = f.id
      JOIN slot_bookings sb ON p.slot_booking_id = sb.id
      JOIN procurement_centres c ON sb.centre_id = c.id
      JOIN quality_checks qc ON p.quality_check_id = qc.id
      WHERE sb.token_number = ?
    `, [req.params.tokenId]);

    if (!pay) {
      return res.status(404).json({ success: false, message: 'Payment record not found for token' });
    }

    res.json({
      success: true,
      data: {
        ...pay,
        stage_history: JSON.parse(pay.stage_history),
        availableStages: PAYMENT_STAGES
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/payments/:id/advance-stage
 * Differentiator #2: Advances payment through granular 6-stage state machine
 * gate_pass_issued -> quality_verified -> paperwork_matched -> produce_lifted -> payment_initiated -> payment_credited
 */
router.patch('/:id/advance-stage', (req, res) => {
  try {
    const paymentId = req.params.id;
    const { target_stage } = req.body;

    const pay = queryOne('SELECT * FROM payment_statuses WHERE id = ? OR slot_booking_id = ?', [
      paymentId,
      paymentId
    ]);

    if (!pay) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const { currentStage, stageHistory, isFinished } = advancePaymentStage(pay.stage_history, target_stage);

    const now = new Date().toISOString();
    const settlementDate = isFinished ? now.split('T')[0] : pay.settlement_date;

    run(`
      UPDATE payment_statuses 
      SET current_stage = ?, stage_history = ?, settlement_date = ?, updated_at = ?
      WHERE id = ?
    `, [currentStage, JSON.stringify(stageHistory), settlementDate, now, pay.id]);

    // Update slot booking status if complete
    if (isFinished) {
      run(`
        UPDATE slot_bookings 
        SET status = 'COMPLETED', current_step_index = 3 
        WHERE id = ?
      `, [pay.slot_booking_id]);
    }

    // Lookup stage info for human-readable notification
    const stageInfo = PAYMENT_STAGES.find(s => s.stage === currentStage) || { label: currentStage, description: '' };

    // Trigger SMS to Farmer on stage change
    const smsId = `sms-${Date.now()}`;
    const smsMsg = isFinished
      ? `FasalExpress DBT Alert: Payout of Rs. ${pay.amount.toLocaleString('en-IN')} credited directly to bank account via PFMS. Ref: ${pay.dbt_ref}.`
      : `FasalExpress Payment Status: Stage advanced to "${stageInfo.label}". ${stageInfo.description}`;

    run(`
      INSERT INTO notifications (id, farmer_id, channel, type, title, message, sent_at)
      VALUES (?, ?, 'sms', 'PAYMENT_STAGE_CHANGE', '💳 Payment Pipeline Update', ?, ?)
    `, [smsId, pay.farmer_id, smsMsg, now]);

    res.json({
      success: true,
      message: `Payment stage advanced to ${currentStage}`,
      payment: {
        id: pay.id,
        currentStage,
        stageLabel: stageInfo.label,
        stageHindiLabel: stageInfo.hindiLabel,
        description: stageInfo.description,
        stageHistory,
        isFinished,
        amount: pay.amount,
        receiptNo: pay.receipt_no,
        dbtRef: pay.dbt_ref
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
