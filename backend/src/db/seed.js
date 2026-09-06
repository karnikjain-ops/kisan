import { db, run, queryOne } from './database.js';

export function seedDatabase() {
  console.log('🌱 Starting KisanQueue database seeding...');

  // Check if already seeded
  const existingFarmer = queryOne('SELECT id FROM farmers WHERE id = ?', ['FARM-2026-9842']);
  if (existingFarmer) {
    console.log('ℹ️ Database already seeded. Skipping initial seed.');
    return;
  }

  // 1. Seed Farmers
  run(`
    INSERT INTO farmers (id, name, phone, village, aadhaar_mock, bank_account_mock, ifsc_mock, land_record_id, created_at)
    VALUES 
    (?, ?, ?, ?, ?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'FARM-2026-9842', 'Rameshwar Singh', '+91 98123 45678', 'Taraori, Karnal', 'XXXX-XXXX-4821', 'SBI A/C ending 4821', 'SBIN0001234', 'LAND-KARNAL-1042', new Date().toISOString(),
    'FARM-2026-5120', 'Gurpreet Singh', '+91 98765 12345', 'Pehowa, Kurukshetra', 'XXXX-XXXX-9134', 'PNB A/C ending 9134', 'PUNB0021000', 'LAND-KKR-3011', new Date().toISOString()
  ]);

  // 2. Seed Land Records (Mocking state Girdawari / Khasra records)
  run(`
    INSERT INTO land_records (id, farmer_id, khasra_mock, area_acres, declared_crop, season, max_yield_quintals_per_acre, assigned_zone_id, verified_bool, created_at)
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'LAND-KARNAL-1042', 'FARM-2026-9842', 'KH-78/14/2', 8.5, 'wheat', 'Rabi 2026', 20.0, 'ZONE-KARNAL-NORTH', 1, new Date().toISOString(),
    'LAND-KKR-3011', 'FARM-2026-5120', 'KH-112/5', 12.0, 'mustard', 'Rabi 2026', 15.0, 'ZONE-KURUKSHETRA-SOUTH', 1, new Date().toISOString()
  ]);

  // 3. Seed Season Configurations (Configurable MSP, moisture thresholds, discount deduction)
  const seasonConfigs = [
    {
      id: 'SC-RABI-2026-WHEAT',
      season: 'Rabi 2026',
      crop: 'wheat',
      crop_name: 'Wheat (गेहूँ)',
      msp_price: 2275,
      moisture_threshold_base: 12.0,
      moisture_threshold_ceiling: 14.0,
      discount_rate_per_point: 25.0,
      reg_start: '2026-08-01T00:00:00Z',
      reg_end: '2026-09-30T23:59:59Z',
      proc_start: '2026-09-01T00:00:00Z',
      proc_end: '2026-11-30T23:59:59Z'
    },
    {
      id: 'SC-KHARIF-2026-PADDY',
      season: 'Kharif 2026',
      crop: 'paddy',
      crop_name: 'Paddy Grade A (धान)',
      msp_price: 2203,
      moisture_threshold_base: 17.0,
      moisture_threshold_ceiling: 19.0,
      discount_rate_per_point: 30.0,
      reg_start: '2026-07-01T00:00:00Z',
      reg_end: '2026-09-15T23:59:59Z',
      proc_start: '2026-09-15T00:00:00Z',
      proc_end: '2026-12-15T23:59:59Z'
    },
    {
      id: 'SC-RABI-2026-MUSTARD',
      season: 'Rabi 2026',
      crop: 'mustard',
      crop_name: 'Mustard (सरसों)',
      msp_price: 5650,
      moisture_threshold_base: 8.0,
      moisture_threshold_ceiling: 10.0,
      discount_rate_per_point: 50.0,
      reg_start: '2026-08-01T00:00:00Z',
      reg_end: '2026-09-30T23:59:59Z',
      proc_start: '2026-09-01T00:00:00Z',
      proc_end: '2026-11-30T23:59:59Z'
    },
    {
      id: 'SC-KHARIF-2026-MAIZE',
      season: 'Kharif 2026',
      crop: 'maize',
      crop_name: 'Maize (मक्का)',
      msp_price: 2090,
      moisture_threshold_base: 14.0,
      moisture_threshold_ceiling: 16.0,
      discount_rate_per_point: 20.0,
      reg_start: '2026-07-01T00:00:00Z',
      reg_end: '2026-09-15T23:59:59Z',
      proc_start: '2026-09-01T00:00:00Z',
      proc_end: '2026-11-30T23:59:59Z'
    },
    {
      id: 'SC-RABI-2026-CHANA',
      season: 'Rabi 2026',
      crop: 'chana',
      crop_name: 'Gram / Chana (चना)',
      msp_price: 5440,
      moisture_threshold_base: 10.0,
      moisture_threshold_ceiling: 12.0,
      discount_rate_per_point: 45.0,
      reg_start: '2026-08-01T00:00:00Z',
      reg_end: '2026-09-30T23:59:59Z',
      proc_start: '2026-09-01T00:00:00Z',
      proc_end: '2026-11-30T23:59:59Z'
    }
  ];

  for (const sc of seasonConfigs) {
    run(`
      INSERT INTO season_configs (
        id, season, crop, crop_name, msp_price, moisture_threshold_base, 
        moisture_threshold_ceiling, discount_rate_per_point, registration_window_start, 
        registration_window_end, procurement_window_start, procurement_window_end, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `, [
      sc.id, sc.season, sc.crop, sc.crop_name, sc.msp_price, sc.moisture_threshold_base,
      sc.moisture_threshold_ceiling, sc.discount_rate_per_point, sc.reg_start, sc.reg_end,
      sc.proc_start, sc.proc_end, new Date().toISOString()
    ]);
  }

  // 4. Seed Procurement Centres with jurisdictional assigned zone IDs
  const centres = [
    {
      id: 'mandi-1',
      name: 'Karnal Central Procurement Mandi',
      location: 'Near GT Road, Karnal',
      district: 'Karnal',
      state: 'Haryana',
      capacity_per_day: 5000,
      max_trucks_per_slot: 15,
      active_counters: 6,
      avg_processing_time_mins: 14,
      assigned_zone_ids: JSON.stringify(['ZONE-KARNAL-NORTH', 'ZONE-KARNAL-CENTRAL']),
      lat: 29.6857,
      lng: 76.9905,
      gate_phone: '+91 98765 43210',
      status: 'Normal'
    },
    {
      id: 'mandi-2',
      name: 'Kurukshetra Grain Market (APMC)',
      location: 'Sector 7, Kurukshetra',
      district: 'Kurukshetra',
      state: 'Haryana',
      capacity_per_day: 4200,
      max_trucks_per_slot: 15,
      active_counters: 4,
      avg_processing_time_mins: 10,
      assigned_zone_ids: JSON.stringify(['ZONE-KURUKSHETRA-SOUTH', 'ZONE-KURUKSHETRA-CENTRAL']),
      lat: 29.9695,
      lng: 76.8783,
      gate_phone: '+91 98765 11223',
      status: 'Recommended'
    },
    {
      id: 'mandi-3',
      name: 'Ambala City Procurement Hub',
      location: 'Grain Market Road, Ambala',
      district: 'Ambala',
      state: 'Haryana',
      capacity_per_day: 6000,
      max_trucks_per_slot: 15,
      active_counters: 8,
      avg_processing_time_mins: 22,
      assigned_zone_ids: JSON.stringify(['ZONE-AMBALA-EAST', 'ZONE-AMBALA-WEST']),
      lat: 30.3782,
      lng: 76.7767,
      gate_phone: '+91 98765 99887',
      status: 'High Congestion'
    }
  ];

  for (const c of centres) {
    run(`
      INSERT INTO procurement_centres (
        id, name, location, district, state, capacity_per_day, max_trucks_per_slot,
        active_counters, avg_processing_time_mins, assigned_zone_ids, lat, lng, gate_phone, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      c.id, c.name, c.location, c.district, c.state, c.capacity_per_day, c.max_trucks_per_slot,
      c.active_counters, c.avg_processing_time_mins, c.assigned_zone_ids, c.lat, c.lng, c.gate_phone, c.status
    ]);
  }

  // 5. Seed Approved Season Registration for Rameshwar Singh
  run(`
    INSERT INTO registrations (id, farmer_id, season_config_id, centre_id, declared_quantity, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'APPROVED', ?)
  `, [
    'REG-2026-001', 'FARM-2026-9842', 'SC-RABI-2026-WHEAT', 'mandi-1', 45.0, new Date().toISOString()
  ]);

  // 6. Seed Slot Booking (Token KQ-408)
  run(`
    INSERT INTO slot_bookings (
      id, token_number, registration_id, farmer_id, centre_id, booked_date,
      time_window, staggered_gate_time, quantity_quintals, status, current_step_index,
      counter_no, queue_position, booking_channel, qr_code_data, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'SLOT-2026-001', 'KQ-408', 'REG-2026-001', 'FARM-2026-9842', 'mandi-1', '2026-09-05',
    '10:00 AM - 01:00 PM', '10:15 AM (15-min Micro Window)', 45.0, 'CHECKED_IN', 2,
    'Counter #3', 4, 'Web Portal', 'KQ-408-FARM-9842-KARNAL', new Date().toISOString()
  ]);

  // Seed supporting tokens ahead in queue for live wait-time realism
  const backgroundTokens = [
    { token: 'KQ-404', status: 'IN_PROGRESS', step: 2, counter: 'Counter #3', pos: 1 },
    { token: 'KQ-405', status: 'IN_PROGRESS', step: 1, counter: 'Counter #1', pos: 2 },
    { token: 'KQ-406', status: 'CHECKED_IN', step: 0, counter: 'Counter #2', pos: 3 }
  ];

  for (const bt of backgroundTokens) {
    run(`
      INSERT INTO slot_bookings (
        id, token_number, registration_id, farmer_id, centre_id, booked_date,
        time_window, staggered_gate_time, quantity_quintals, status, current_step_index,
        counter_no, queue_position, booking_channel, qr_code_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `SLOT-${bt.token}`, bt.token, 'REG-2026-001', 'FARM-2026-5120', 'mandi-1', '2026-09-05',
      '10:00 AM - 01:00 PM', '10:00 AM', 40.0, bt.status, bt.step,
      bt.counter, bt.pos, 'Web Portal', `${bt.token}-MANDI1`, new Date().toISOString()
    ]);
  }

  // 7. Seed Quality Check for KQ-408
  run(`
    INSERT INTO quality_checks (
      id, slot_booking_id, moisture_pct, foreign_matter_pct, outcome, base_msp_rate,
      discount_amount_per_unit, final_price_per_unit, gross_weight_kg, tare_weight_kg,
      accepted_quantity, total_payout, quality_grade, receipt_no, notes, checked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'QC-2026-001', 'SLOT-2026-001', 11.2, 0.4, 'PASS', 2275.0,
    0.0, 2275.0, 4720.0, 220.0,
    45.0, 102375.0, 'Grade A Superfine', 'JFORM-2026-8812', 'Excellent moisture within standard ceiling', new Date().toISOString()
  ]);

  // 8. Seed Payment Pipeline Status (6-stage state machine with real timestamps)
  const initialStageHistory = [
    {
      stage: 'gate_pass_issued',
      label: 'Gate Pass Issued & QR Scanned',
      description: 'Vehicle checked in at Mandi Gate 1 weigh scale entry.',
      timestamp: '2026-09-05T09:15:00Z',
      completed: true
    },
    {
      stage: 'quality_verified',
      label: 'Quality Tested & Grade Approved',
      description: 'Lab test passed. Moisture: 11.2% (Grade A Superfine).',
      timestamp: '2026-09-05T09:42:00Z',
      completed: true
    },
    {
      stage: 'paperwork_matched',
      label: 'J-Form & Weighbridge Matched',
      description: 'Net weight 45.0 Quintals matched to official J-Form #JFORM-2026-8812.',
      timestamp: '2026-09-05T10:10:00Z',
      completed: true
    },
    {
      stage: 'produce_lifted',
      label: 'Produce Lifted from Mandi Storage',
      description: 'Consignment loaded onto state storage transit trucks.',
      timestamp: '2026-09-05T11:30:00Z',
      completed: true
    },
    {
      stage: 'payment_initiated',
      label: 'Payment Initiated via PFMS',
      description: 'DBT Batch file sent to Public Financial Management System.',
      timestamp: '2026-09-05T12:15:00Z',
      completed: true
    },
    {
      stage: 'payment_credited',
      label: 'Payment Credited via DBT',
      description: 'Amount ₹1,02,375 successfully credited to SBI A/C ending 4821.',
      timestamp: '2026-09-05T12:45:00Z',
      completed: true
    }
  ];

  run(`
    INSERT INTO payment_statuses (
      id, quality_check_id, slot_booking_id, farmer_id, amount, current_stage,
      stage_history, receipt_no, dbt_ref, settlement_date, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'PAY-2026-001', 'QC-2026-001', 'SLOT-2026-001', 'FARM-2026-9842', 102375.0,
    'payment_credited', JSON.stringify(initialStageHistory), 'JFORM-2026-8812', 'DBT-2026-991823', '2026-09-05', new Date().toISOString()
  ]);

  // 9. Seed Notifications
  const notifications = [
    {
      id: 'sms-1',
      farmer_id: 'FARM-2026-9842',
      channel: 'sms',
      type: 'SLOT_CONFIRMATION',
      title: '✅ Slot Booking Confirmed',
      message: 'KisanQueue: Slot Confirmed for Wheat (45 Qt) at Karnal Central Mandi on 05 Sept, 10:00 AM. Token #KQ-408. Show QR code at Gate 1.',
      sent_at: '2026-09-04T09:15:00Z'
    },
    {
      id: 'sms-2',
      farmer_id: 'FARM-2026-9842',
      channel: 'sms',
      type: 'TRANSIT_ALERT',
      title: '🚗 Depart for Mandi Alert',
      message: 'KisanQueue Transit Alert: High gate throughput. Depart now from Taraori to arrive comfortably by 10:00 AM. Your queue position is #4.',
      sent_at: '2026-09-05T09:30:00Z'
    }
  ];

  for (const n of notifications) {
    run(`
      INSERT INTO notifications (id, farmer_id, channel, type, title, message, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [n.id, n.farmer_id, n.channel, n.type, n.title, n.message, n.sent_at]);
  }

  console.log('✅ KisanQueue database seeded successfully with realistic MSP domain data.');
}

// Auto-run when executed directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
