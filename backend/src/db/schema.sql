-- KisanQueue Database Schema (SIH 2026 PS 26032)
-- Relational Schema modeling real Indian MSP Procurement

CREATE TABLE IF NOT EXISTS farmers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  village TEXT NOT NULL,
  aadhaar_mock TEXT NOT NULL,
  bank_account_mock TEXT NOT NULL,
  ifsc_mock TEXT NOT NULL,
  land_record_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS land_records (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL,
  khasra_mock TEXT NOT NULL,
  area_acres REAL NOT NULL,
  declared_crop TEXT NOT NULL,
  season TEXT NOT NULL,
  max_yield_quintals_per_acre REAL NOT NULL DEFAULT 20.0,
  assigned_zone_id TEXT NOT NULL,
  verified_bool INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);

CREATE TABLE IF NOT EXISTS season_configs (
  id TEXT PRIMARY KEY,
  season TEXT NOT NULL,
  crop TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  msp_price REAL NOT NULL,
  moisture_threshold_base REAL NOT NULL,
  moisture_threshold_ceiling REAL NOT NULL,
  discount_rate_per_point REAL NOT NULL,
  foreign_matter_threshold_base REAL NOT NULL DEFAULT 0.75,
  foreign_matter_threshold_ceiling REAL NOT NULL DEFAULT 2.0,
  registration_window_start TEXT NOT NULL,
  registration_window_end TEXT NOT NULL,
  procurement_window_start TEXT NOT NULL,
  procurement_window_end TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS procurement_centres (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  capacity_per_day REAL NOT NULL,
  max_trucks_per_slot INTEGER NOT NULL DEFAULT 15,
  active_counters INTEGER NOT NULL DEFAULT 6,
  avg_processing_time_mins REAL NOT NULL DEFAULT 14,
  assigned_zone_ids TEXT NOT NULL, -- JSON array of zone strings
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  gate_phone TEXT NOT NULL,
  gate_paused INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Normal'
);

CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL,
  season_config_id TEXT NOT NULL,
  centre_id TEXT NOT NULL,
  declared_quantity REAL NOT NULL,
  status TEXT NOT NULL, -- 'APPROVED', 'REJECTED'
  rejection_reason TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id),
  FOREIGN KEY (season_config_id) REFERENCES season_configs(id),
  FOREIGN KEY (centre_id) REFERENCES procurement_centres(id)
);

CREATE TABLE IF NOT EXISTS slot_bookings (
  id TEXT PRIMARY KEY,
  token_number TEXT NOT NULL UNIQUE,
  registration_id TEXT NOT NULL,
  farmer_id TEXT NOT NULL,
  centre_id TEXT NOT NULL,
  booked_date TEXT NOT NULL,
  time_window TEXT NOT NULL,
  staggered_gate_time TEXT NOT NULL,
  quantity_quintals REAL NOT NULL,
  status TEXT NOT NULL, -- 'BOOKED', 'ARRIVED', 'IN_PROGRESS', 'WEIGHED', 'COMPLETED', 'REJECTED', 'NO_SHOW'
  current_step_index INTEGER NOT NULL DEFAULT 0,
  counter_no TEXT NOT NULL,
  queue_position INTEGER NOT NULL,
  booking_channel TEXT NOT NULL DEFAULT 'Web Portal',
  qr_code_data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (registration_id) REFERENCES registrations(id),
  FOREIGN KEY (farmer_id) REFERENCES farmers(id),
  FOREIGN KEY (centre_id) REFERENCES procurement_centres(id)
);

CREATE TABLE IF NOT EXISTS quality_checks (
  id TEXT PRIMARY KEY,
  slot_booking_id TEXT NOT NULL UNIQUE,
  moisture_pct REAL NOT NULL,
  foreign_matter_pct REAL NOT NULL,
  outcome TEXT NOT NULL, -- 'PASS', 'DISCOUNT', 'FAIL'
  base_msp_rate REAL NOT NULL,
  discount_amount_per_unit REAL NOT NULL DEFAULT 0,
  final_price_per_unit REAL NOT NULL,
  gross_weight_kg REAL NOT NULL,
  tare_weight_kg REAL NOT NULL,
  accepted_quantity REAL NOT NULL,
  total_payout REAL NOT NULL,
  quality_grade TEXT NOT NULL,
  receipt_no TEXT NOT NULL,
  notes TEXT,
  checked_at TEXT NOT NULL,
  FOREIGN KEY (slot_booking_id) REFERENCES slot_bookings(id)
);

CREATE TABLE IF NOT EXISTS payment_statuses (
  id TEXT PRIMARY KEY,
  quality_check_id TEXT NOT NULL UNIQUE,
  slot_booking_id TEXT NOT NULL UNIQUE,
  farmer_id TEXT NOT NULL,
  amount REAL NOT NULL,
  current_stage TEXT NOT NULL, -- 'gate_pass_issued', 'quality_verified', 'paperwork_matched', 'produce_lifted', 'payment_initiated', 'payment_credited'
  stage_history TEXT NOT NULL, -- JSON array of { stage, label, timestamp, completed }
  receipt_no TEXT NOT NULL,
  dbt_ref TEXT NOT NULL,
  settlement_date TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (quality_check_id) REFERENCES quality_checks(id),
  FOREIGN KEY (slot_booking_id) REFERENCES slot_bookings(id),
  FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'sms',
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_land_records_farmer ON land_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_registrations_farmer ON registrations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_slot_bookings_date_centre ON slot_bookings(booked_date, centre_id);
CREATE INDEX IF NOT EXISTS idx_slot_bookings_token ON slot_bookings(token_number);
CREATE INDEX IF NOT EXISTS idx_notifications_farmer ON notifications(farmer_id);
