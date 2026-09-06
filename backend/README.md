# KisanQueue Backend Engine
**SIH 2026 PS 26032 — Smart Farmer Procurement & Live Queue Platform**  
*Department of Consumer Affairs, Government of India*

---

## 🌾 Real-World Indian MSP Domain Model

Unlike generic slot-booking or open-market auction apps, this backend encodes the actual operational mechanics of Indian Minimum Support Price (MSP) grain procurement:

1. **Single Government Buyer**: Pre-fixed MSP rates with zero matching algorithms or buyer bidding.
2. **Two Sequential Flows (Never Collapsed)**:
   - **Season Registration (`POST /api/farmers/register`)**: Once per season during the statutory registration window. Validates against Khasra land records (`LandRecord`). Rejects crop mismatches and quantity declarations exceeding verified land yield quotas.
   - **Staggered Slot Booking (`POST /api/slots/book`)**: Per delivery closer to physical harvest. Staggers vehicles into 15-minute micro departure windows to prevent gate traffic jams.
3. **Jurisdictional Mandi Assignment**: Farmers are assigned to procurement centres serving their specific land revenue zone (`assigned_zone_ids`). Free-choice "browse any centre" is rejected as domain-inaccurate.
4. **Three-Outcome Quality Inspection (`POST /api/quality-checks`)**:
   - **Pass (Within Base Limit)**: Full statutory MSP rate.
   - **Marginal Discount (Between Base & Ceiling)**: Deduction applied per point of excess moisture (`discount_rate_per_point`).
   - **Fail (Over Hard Ceiling)**: Immediate terminal rejection at gate.
5. **Multi-Stage Payment State Machine (`PATCH /api/payments/:id/advance-stage`)**:
   - Explicit 6-stage lifecycle with timestamps:
     `gate_pass_issued` $\rightarrow$ `quality_verified` $\rightarrow$ `paperwork_matched` $\rightarrow$ `produce_lifted` $\rightarrow$ `payment_initiated` $\rightarrow$ `payment_credited`
6. **Live Wait-Time Prediction Engine**:
   $$\text{EstimatedWaitMins} = \max\left(5, \text{round}\left(\frac{(\text{QueuePosition} - 1) \times \text{AvgProcessingMins}}{\text{ActiveCounters}}\right)\right)$$

---

## 🛠️ Tech Stack & Schema

- **Runtime**: Node.js v24 (ES Modules)
- **Framework**: Express.js
- **Database**: SQLite with Node.js built-in `DatabaseSync` (zero daemon dependencies, ACID relational integrity)
- **Entities**:
  - `farmers`
  - `land_records`
  - `season_configs`
  - `procurement_centres`
  - `registrations`
  - `slot_bookings`
  - `quality_checks`
  - `payment_statuses`
  - `notifications`

---

## 🚀 Quick Start

### 1. Install & Seed
```bash
cd backend
npm install
npm run seed
```

### 2. Start Server
```bash
npm start
# Runs on http://localhost:5000
# API Health: http://localhost:5000/api/health
```

### 3. Run Automated Domain Test Suite
```bash
node test-api.js
```

---

## 📡 API Reference

### Farmer Flow
- `GET /api/farmers` — List registered farmers.
- `GET /api/farmers/:id/profile` — Farmer land records and bank info.
- `POST /api/farmers/register` — Validates Khasra record, rejects crop/quota mismatches, assigns centre.
- `GET /api/farmers/:id/status` — Complete aggregate status across registration $\rightarrow$ slots $\rightarrow$ quality $\rightarrow$ payment.

### Slot & Staggered Gate Pass
- `GET /api/slots` — List slot bookings (with query filters for date, centre, status).
- `GET /api/slots/:tokenId` — Retrieve token details and live pass status.
- `POST /api/slots/book` — Creates slot with 15-minute micro-staggered window.

### Mandi & Live Queue (Differentiator #1)
- `GET /api/centres` — Mandi list with active counters and booked capacity.
- `GET /api/centres/:id/queue` — Live queue position, estimated wait time, currently serving token, and 4-stage yard breakdown.
- `POST /api/centres/:id/process-arrival` — Staff scans token at gate.
- `POST /api/centres/:id/advance-queue` — Advances queue counters.
- `POST /api/centres/:id/pause-gate` & `/resume-gate` — Gate traffic control.

### Quality & Weighbridge
- `POST /api/quality-checks` — Evaluates Pass, Marginal Discount, or Rejection based on `SeasonConfig`.
- `GET /api/quality-checks/:slotBookingId` — Weighbridge and lab slip.

### Multi-Stage Payments (Differentiator #2)
- `GET /api/payments/:id` — Payment details with stage history and timestamps.
- `GET /api/payments/by-token/:tokenId` — Payment record by token number.
- `PATCH /api/payments/:id/advance-stage` — Advances payment through the 6 stages.

### Admin & Configuration
- `GET /api/admin/season-config` — List active season configurations.
- `POST /api/admin/season-config` — Create new season configuration.
- `PUT /api/admin/season-config/:id` — Update MSP rate, moisture ceiling, deduction rates, or window dates.

### Notifications & SMS
- `GET /api/notifications?farmer_id=...` — Recent SMS alert logs.
- `POST /api/notifications/trigger` — Trigger custom or event alert.

---

> [!NOTE]
> External government databases (State Girdawari Land Records, UIDAI Aadhaar, PFMS gateway) are mocked with realistic schemas and sample records. In a production deployment, these models map 1:1 to state APIs via Agristack / PM-KISAN / PFMS adapters.
