import { Router } from 'express';
import { queryAll, queryOne, run } from '../db/database.js';

const router = Router();

/**
 * GET /api/farmers
 * List registered farmers
 */
router.get('/', (req, res) => {
  try {
    const farmers = queryAll('SELECT * FROM farmers ORDER BY created_at DESC');
    res.json({ success: true, count: farmers.length, data: farmers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/farmers/:id/profile
 * Farmer profile & land records
 */
router.get('/:id/profile', (req, res) => {
  try {
    const farmer = queryOne('SELECT * FROM farmers WHERE id = ?', [req.params.id]);
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const landRecords = queryAll('SELECT * FROM land_records WHERE farmer_id = ?', [farmer.id]);
    res.json({
      success: true,
      data: {
        farmerId: farmer.id,
        name: farmer.name,
        phone: farmer.phone,
        village: farmer.village,
        aadhaarLast4: farmer.aadhaar_mock.slice(-4),
        bankAccount: farmer.bank_account_mock,
        ifsc: farmer.ifsc_mock,
        totalLandAcres: landRecords.reduce((sum, r) => sum + r.area_acres, 0),
        landRecords
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/farmers/onboard
 * Register a new Farmer beneficiary with verified Land Record (Khasra) and DBT Bank Details
 */
router.post('/onboard', (req, res) => {
  try {
    const {
      name,
      phone,
      village = 'Taraori, Karnal',
      district = 'Karnal',
      state = 'Haryana',
      aadhaar,
      bank_account,
      ifsc,
      khasra,
      area_acres,
      declared_crop = 'wheat',
      season = 'Rabi 2026',
      assigned_zone_id = 'ZONE-KARNAL-NORTH'
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Farmer full name and phone number are required.'
      });
    }

    // Clean phone and aadhaar
    const cleanPhone = phone.startsWith('+91') ? phone : `+91 ${phone.replace(/\D/g, '')}`;
    const cleanAadhaar = aadhaar ? aadhaar.replace(/\D/g, '') : '998877665544';
    const aadhaarFormatted = `XXXX-XXXX-${cleanAadhaar.slice(-4)}`;

    const farmerId = `FARM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const landId = `LAND-${district.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedAcres = parseFloat(area_acres) || 5.0;
    const createdAt = new Date().toISOString();

    // 1. Insert Farmer
    run(`
      INSERT INTO farmers (id, name, phone, village, aadhaar_mock, bank_account_mock, ifsc_mock, land_record_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      farmerId,
      name.trim(),
      cleanPhone,
      village ? `${village}, ${district}` : `${district}, ${state}`,
      aadhaarFormatted,
      bank_account || 'SBI A/C ending ' + cleanAadhaar.slice(-4),
      ifsc || 'SBIN0001234',
      landId,
      createdAt
    ]);

    // 2. Insert Land Record
    run(`
      INSERT INTO land_records (id, farmer_id, khasra_mock, area_acres, declared_crop, season, max_yield_quintals_per_acre, assigned_zone_id, verified_bool, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `, [
      landId,
      farmerId,
      khasra || `KH-${Math.floor(10 + Math.random() * 90)}/${Math.floor(1 + Math.random() * 20)}`,
      parsedAcres,
      declared_crop.toLowerCase(),
      season,
      20.0,
      assigned_zone_id,
      createdAt
    ]);

    // 3. Welcome Notification
    const notifId = `NOTIF-${Date.now()}`;
    run(`
      INSERT INTO notifications (id, farmer_id, channel, type, title, message, sent_at)
      VALUES (?, ?, 'sms', 'FARMER_ONBOARDED', '✅ PM-KISAN Registration Complete', ?, ?)
    `, [
      notifId,
      farmerId,
      `Welcome to FasalExpress, ${name}! Your farmer beneficiary profile and Khasra record (${khasra || 'Verified'}) are successfully registered. You are eligible for Rabi 2026 MSP procurement.`,
      createdAt
    ]);

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully',
      data: {
        farmerId,
        name,
        phone: cleanPhone,
        village: `${village}, ${district}`,
        aadhaarLast4: cleanAadhaar.slice(-4),
        bankAccount: bank_account || 'SBI A/C ending ' + cleanAadhaar.slice(-4),
        ifsc: ifsc || 'SBIN0001234',
        totalLandAcres: parsedAcres,
        landRecord: {
          id: landId,
          khasra: khasra || 'KH-88/14',
          areaAcres: parsedAcres,
          declaredCrop: declared_crop,
          assignedZoneId: assigned_zone_id,
          verified: true
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/farmers/register
 * Step 1 Flow: Season Registration (Once per season)
 * Validates against LandRecord (Khasra/Girdawari) and enforces jurisdictional centre assignment
 */
router.post('/register', (req, res) => {
  try {
    const {
      farmer_id,
      land_record_id,
      season_config_id,
      centre_id,
      declared_quantity
    } = req.body;

    if (!farmer_id || !land_record_id || !season_config_id || !declared_quantity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: farmer_id, land_record_id, season_config_id, declared_quantity'
      });
    }

    // 1. Verify Farmer
    const farmer = queryOne('SELECT * FROM farmers WHERE id = ?', [farmer_id]);
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found in registry' });
    }

    // 2. Verify Land Record
    const landRecord = queryOne('SELECT * FROM land_records WHERE id = ? AND farmer_id = ?', [
      land_record_id,
      farmer_id
    ]);
    if (!landRecord) {
      return res.status(404).json({
        success: false,
        message: 'Land record not found or does not belong to this farmer'
      });
    }

    if (!landRecord.verified_bool) {
      return res.status(400).json({
        success: false,
        message: 'Land record is unverified by Revenue Department (Khasra verification required).'
      });
    }

    // 3. Verify Season Config
    const seasonConfig = queryOne('SELECT * FROM season_configs WHERE id = ?', [season_config_id]);
    if (!seasonConfig) {
      return res.status(404).json({ success: false, message: 'Season configuration not found' });
    }

    // Check Registration Window Dates
    const now = new Date();
    const regStart = new Date(seasonConfig.registration_window_start);
    const regEnd = new Date(seasonConfig.registration_window_end);
    if (now < regStart || now > regEnd) {
      return res.status(400).json({
        success: false,
        message: `Registration window closed. Active window was ${seasonConfig.registration_window_start.split('T')[0]} to ${seasonConfig.registration_window_end.split('T')[0]}`
      });
    }

    // 4. Strict Domain Rule: Crop Mismatch Rejection
    if (landRecord.declared_crop.toLowerCase() !== seasonConfig.crop.toLowerCase()) {
      return res.status(400).json({
        success: false,
        code: 'CROP_MISMATCH_REJECTED',
        message: `Registration Rejected: Land Record (${landRecord.khasra_mock}) is certified for "${landRecord.declared_crop}", but registration requested "${seasonConfig.crop}". Crop mismatch rejected at registration.`
      });
    }

    // 5. Strict Domain Rule: Land Yield Quota Rejection
    const maxAllowableQuintals = landRecord.area_acres * landRecord.max_yield_quintals_per_acre;
    const requestedQty = parseFloat(declared_quantity);
    if (requestedQty > maxAllowableQuintals) {
      return res.status(400).json({
        success: false,
        code: 'QUANTITY_EXCEEDS_LAND_QUOTA',
        message: `Registration Rejected: Declared quantity (${requestedQty} Quintals) exceeds maximum allowable yield (${maxAllowableQuintals} Quintals) for ${landRecord.area_acres} acres under APMC standards.`
      });
    }

    // 6. Strict Domain Rule: Jurisdictional Centre Assignment
    // Find centres that serve this farmer's assigned land zone
    const allCentres = queryAll('SELECT * FROM procurement_centres');
    const validCentres = allCentres.filter(c => {
      try {
        const zones = JSON.parse(c.assigned_zone_ids);
        return zones.includes(landRecord.assigned_zone_id);
      } catch (e) {
        return false;
      }
    });

    if (validCentres.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No active procurement centre assigned to land revenue zone: ${landRecord.assigned_zone_id}`
      });
    }

    // If centre_id specified, ensure it belongs to the valid set; otherwise assign nearest/primary
    let assignedCentre = validCentres[0];
    if (centre_id) {
      const match = validCentres.find(c => c.id === centre_id);
      if (!match) {
        return res.status(400).json({
          success: false,
          code: 'CENTRE_OUT_OF_JURISDICTION',
          message: `Jurisdiction Mismatch: Mandi "${centre_id}" does not serve your land jurisdiction zone "${landRecord.assigned_zone_id}". Valid assigned centre is "${validCentres[0].name}".`
        });
      }
      assignedCentre = match;
    }

    // 7. Check if already registered for this season
    const existingReg = queryOne(
      'SELECT id FROM registrations WHERE farmer_id = ? AND season_config_id = ? AND status = "APPROVED"',
      [farmer_id, season_config_id]
    );
    if (existingReg) {
      return res.status(400).json({
        success: false,
        message: 'Farmer is already registered for this season. Proceed directly to slot booking.'
      });
    }

    // 8. Create Registration
    const regId = `REG-${Date.now().toString().slice(-6)}`;
    run(`
      INSERT INTO registrations (id, farmer_id, season_config_id, centre_id, declared_quantity, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'APPROVED', ?)
    `, [regId, farmer_id, season_config_id, assignedCentre.id, requestedQty, new Date().toISOString()]);

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully for season procurement',
      registration: {
        id: regId,
        farmerId: farmer_id,
        seasonConfigId: season_config_id,
        crop: seasonConfig.crop_name,
        declaredQuantityQuintals: requestedQty,
        assignedCentre: {
          id: assignedCentre.id,
          name: assignedCentre.name,
          district: assignedCentre.district
        },
        landRecord: {
          khasra: landRecord.khasra_mock,
          areaAcres: landRecord.area_acres,
          zone: landRecord.assigned_zone_id
        },
        status: 'APPROVED'
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/farmers/:id/status
 * Aggregated status across Registration -> Slot -> Quality -> Multi-Stage Payment
 */
router.get('/:id/status', (req, res) => {
  try {
    const farmerId = req.params.id;
    const farmer = queryOne('SELECT * FROM farmers WHERE id = ?', [farmerId]);
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const landRecords = queryAll('SELECT * FROM land_records WHERE farmer_id = ?', [farmerId]);
    const registrations = queryAll(`
      SELECT r.*, sc.crop_name, sc.msp_price, c.name as centre_name
      FROM registrations r
      JOIN season_configs sc ON r.season_config_id = sc.id
      JOIN procurement_centres c ON r.centre_id = c.id
      WHERE r.farmer_id = ?
      ORDER BY r.created_at DESC
    `, [farmerId]);

    const tickets = queryAll(`
      SELECT sb.*, c.name as centre_name, c.district, c.avg_processing_time_mins, c.active_counters
      FROM slot_bookings sb
      JOIN procurement_centres c ON sb.centre_id = c.id
      WHERE sb.farmer_id = ?
      ORDER BY sb.created_at DESC
    `, [farmerId]);

    // Format tickets with latest quality and payment status
    const formattedTickets = tickets.map(tk => {
      const qc = queryOne('SELECT * FROM quality_checks WHERE slot_booking_id = ?', [tk.id]);
      const pay = queryOne('SELECT * FROM payment_statuses WHERE slot_booking_id = ?', [tk.id]);

      return {
        tokenId: tk.token_number,
        farmerName: farmer.name,
        farmerId: farmer.id,
        phone: farmer.phone,
        mandiName: tk.centre_name,
        mandiId: tk.centre_id,
        cropName: 'Wheat (गेहूँ)',
        quantityQuintals: tk.quantity_quintals,
        mspRate: qc ? qc.base_msp_rate : 2275,
        estimatedPayout: qc ? qc.total_payout : tk.quantity_quintals * 2275,
        slotDate: tk.booked_date,
        timeWindow: tk.time_window,
        staggeredGateTime: tk.staggered_gate_time,
        counterNo: tk.counter_no,
        status: tk.status,
        currentStepIndex: tk.current_step_index,
        queuePosition: tk.queue_position,
        estimatedWaitMins: Math.max(5, Math.round(((tk.queue_position - 1) * tk.avg_processing_time_mins) / tk.active_counters)),
        qrCodeData: tk.qr_code_data,
        bookingChannel: tk.booking_channel,
        weighbridgeDetails: qc ? {
          grossWeightKg: qc.gross_weight_kg,
          tareWeightKg: qc.tare_weight_kg,
          netWeightKg: qc.gross_weight_kg - qc.tare_weight_kg,
          moisturePercent: `${qc.moisture_pct}%`,
          qualityGrade: qc.quality_grade,
          receiptNo: qc.receipt_no,
          outcome: qc.outcome,
          discountAmountPerUnit: qc.discount_amount_per_unit,
          finalPricePerUnit: qc.final_price_per_unit
        } : null,
        paymentDetails: pay ? {
          dbtStatus: pay.current_stage === 'payment_credited' ? 'SUCCESS' : 'IN_PROGRESS',
          currentStage: pay.current_stage,
          stageHistory: JSON.parse(pay.stage_history),
          txnRef: pay.dbt_ref,
          amount: pay.amount,
          settlementDate: pay.settlement_date
        } : null
      };
    });

    res.json({
      success: true,
      farmerProfile: {
        farmerId: farmer.id,
        name: farmer.name,
        phone: farmer.phone,
        village: farmer.village,
        aadhaarLast4: farmer.aadhaar_mock.slice(-4),
        bankAccount: farmer.bank_account_mock,
        ifsc: farmer.ifsc_mock,
        totalLandAcres: landRecords.reduce((sum, r) => sum + r.area_acres, 0)
      },
      registrations,
      tickets: formattedTickets
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
