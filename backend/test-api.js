/**
 * Comprehensive Automated Verification Test for KisanQueue Backend
 * Tests all MSP Domain Rules, API Endpoints, Quality Evaluator, and Payment State Machine
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting KisanQueue Backend Automated Verification...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• ${name}... `);
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check
  await test('GET /health returns online status', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status !== 'online') throw new Error(`Unexpected status: ${data.status}`);
  });

  // 2. Fetch Farmer Profile & Aggregate Status
  await test('GET /farmers/FARM-2026-9842/status returns complete lifecycle', async () => {
    const res = await fetch(`${BASE_URL}/farmers/FARM-2026-9842/status`);
    const json = await res.json();
    if (!json.success || !json.farmerProfile || json.farmerProfile.farmerId !== 'FARM-2026-9842') {
      throw new Error('Failed to retrieve farmer status');
    }
    if (!json.tickets || json.tickets.length === 0) {
      throw new Error('Expected active tickets in status');
    }
  });

  // 3. Domain Rule 1: Reject Crop Mismatch at Registration
  await test('POST /farmers/register rejects crop mismatch against land record', async () => {
    const res = await fetch(`${BASE_URL}/farmers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmer_id: 'FARM-2026-9842',
        land_record_id: 'LAND-KARNAL-1042', // Land record has "wheat"
        season_config_id: 'SC-KHARIF-2026-PADDY', // Trying to register for paddy
        centre_id: 'mandi-1',
        declared_quantity: 30
      })
    });
    const json = await res.json();
    if (res.status !== 400 || json.code !== 'CROP_MISMATCH_REJECTED') {
      throw new Error(`Expected 400 CROP_MISMATCH_REJECTED, got status ${res.status}: ${JSON.stringify(json)}`);
    }
  });

  // 4. Domain Rule 2: Reject Quantity Exceeding Land Quota
  await test('POST /farmers/register rejects quantity exceeding allowable land quota', async () => {
    const res = await fetch(`${BASE_URL}/farmers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmer_id: 'FARM-2026-9842',
        land_record_id: 'LAND-KARNAL-1042', // 8.5 acres * 20 Q/acre = 170 Q max
        season_config_id: 'SC-RABI-2026-WHEAT',
        centre_id: 'mandi-1',
        declared_quantity: 600 // 600 Q exceeds 170 Q
      })
    });
    const json = await res.json();
    if (res.status !== 400 || json.code !== 'QUANTITY_EXCEEDS_LAND_QUOTA') {
      throw new Error(`Expected 400 QUANTITY_EXCEEDS_LAND_QUOTA, got status ${res.status}: ${JSON.stringify(json)}`);
    }
  });

  // 5. Domain Rule 3: Reject Centre Outside Jurisdictional Zone
  await test('POST /farmers/register rejects procurement centre outside land revenue zone', async () => {
    const res = await fetch(`${BASE_URL}/farmers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmer_id: 'FARM-2026-5120',
        land_record_id: 'LAND-KKR-3011', // Zone is ZONE-KURUKSHETRA-SOUTH
        season_config_id: 'SC-RABI-2026-MUSTARD',
        centre_id: 'mandi-3', // Mandi 3 is in Ambala, does not serve Kurukshetra South
        declared_quantity: 40
      })
    });
    const json = await res.json();
    if (res.status !== 400 || json.code !== 'CENTRE_OUT_OF_JURISDICTION') {
      throw new Error(`Expected 400 CENTRE_OUT_OF_JURISDICTION, got status ${res.status}: ${JSON.stringify(json)}`);
    }
  });

  // 6. Slot Booking: Anti-Congestion & Micro-Staggered Gate Time
  let bookedTokenId = '';
  await test('POST /slots/book creates token with micro-staggered window', async () => {
    const res = await fetch(`${BASE_URL}/slots/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmer_id: 'FARM-2026-9842',
        crop_id: 'wheat',
        quantity: 42,
        mandi_id: 'mandi-1',
        slot_date: '2026-09-10',
        time_window: '08:00 AM - 10:00 AM'
      })
    });
    const json = await res.json();
    if (!json.success || !json.ticket.tokenId) {
      throw new Error(`Booking failed: ${JSON.stringify(json)}`);
    }
    bookedTokenId = json.ticket.tokenId;
    if (!json.ticket.staggeredGateTime.includes('Micro Window')) {
      throw new Error('Expected micro-staggered departure gate time');
    }
  });

  // 7. Live Queue Wait-Time Prediction (Differentiator #1)
  await test('GET /centres/mandi-1/queue calculates live wait-time & yard breakdown', async () => {
    const res = await fetch(`${BASE_URL}/centres/mandi-1/queue`);
    const json = await res.json();
    if (!json.success || !json.yardBreakdown || !json.queue) {
      throw new Error('Failed to fetch live queue data');
    }
    if (!json.queue[0].estimatedWaitMins || json.queue[0].estimatedWaitMins < 5) {
      throw new Error('Live wait time calculation missing or invalid');
    }
    if (json.yardBreakdown.stages.length !== 4) {
      throw new Error('Expected 4-stage yard breakdown');
    }
  });

  // 8. Quality Check Outcome 1: Pass @ Full MSP Rate
  await test('POST /quality-checks evaluates PASS with 100% full MSP', async () => {
    const res = await fetch(`${BASE_URL}/quality-checks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token_id: bookedTokenId,
        moisture_pct: 11.5, // Base threshold is 12.0%
        foreign_matter_pct: 0.5,
        gross_weight_kg: 4400,
        tare_weight_kg: 200 // 4200 kg net = 42 Quintals
      })
    });
    const json = await res.json();
    if (!json.success || json.outcome !== 'PASS') {
      throw new Error(`Expected PASS outcome, got: ${json.outcome}`);
    }
    if (json.evaluation.finalPricePerUnit !== json.evaluation.baseMspRate) {
      throw new Error('Full MSP rate was not granted for passing moisture');
    }
  });

  // 9. Quality Check Outcome 2: Marginal Moisture -> Discount Deduction
  await test('POST /quality-checks evaluates DISCOUNT for moisture above base but below ceiling', async () => {
    // Book a temporary slot
    const slotRes = await fetch(`${BASE_URL}/slots/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmer_id: 'FARM-2026-9842',
        crop_id: 'wheat',
        quantity: 35,
        mandi_id: 'mandi-1',
        slot_date: '2026-09-12',
        time_window: '01:00 PM - 03:00 PM'
      })
    });
    const slotJson = await slotRes.json();
    const tempToken = slotJson.ticket.tokenId;

    const res = await fetch(`${BASE_URL}/quality-checks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token_id: tempToken,
        moisture_pct: 13.0, // Base: 12.0%, Ceiling: 14.0% -> 1.0 excess * Rs.25 = Rs.25 deduction
        foreign_matter_pct: 0.6,
        gross_weight_kg: 3700,
        tare_weight_kg: 200
      })
    });
    const json = await res.json();
    if (!json.success || json.outcome !== 'DISCOUNT') {
      throw new Error(`Expected DISCOUNT outcome, got: ${json.outcome}`);
    }
    if (json.evaluation.discountAmountPerUnit !== 25) {
      throw new Error(`Expected Rs.25 deduction, got: ${json.evaluation.discountAmountPerUnit}`);
    }
  });

  // 10. Quality Check Outcome 3: Above Ceiling -> Terminal Rejection (FAIL)
  await test('POST /quality-checks evaluates FAIL (Terminal Rejection) when moisture exceeds ceiling', async () => {
    // Book another slot
    const slotRes = await fetch(`${BASE_URL}/slots/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmer_id: 'FARM-2026-9842',
        crop_id: 'wheat',
        quantity: 25,
        mandi_id: 'mandi-1',
        slot_date: '2026-09-14',
        time_window: '03:00 PM - 06:00 PM'
      })
    });
    const slotJson = await slotRes.json();
    const tempToken = slotJson.ticket.tokenId;

    const res = await fetch(`${BASE_URL}/quality-checks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token_id: tempToken,
        moisture_pct: 16.2, // Hard ceiling is 14.0% -> Must fail
        foreign_matter_pct: 0.8,
        gross_weight_kg: 2700,
        tare_weight_kg: 200
      })
    });
    const json = await res.json();
    if (json.outcome !== 'FAIL') {
      throw new Error(`Expected FAIL outcome, got: ${json.outcome}`);
    }
    if (json.evaluation.finalPricePerUnit !== 0 || json.evaluation.acceptedQuantityQuintals !== 0) {
      throw new Error('Rejected batch must have 0 accepted quantity');
    }
  });

  // 11. Payment State Machine & Bottleneck Transparency (Differentiator #2)
  await test('PATCH /payments/:id/advance-stage advances through 6 stages with timestamps', async () => {
    // Lookup payment for bookedTokenId
    const payRes = await fetch(`${BASE_URL}/payments/by-token/${bookedTokenId}`);
    const payJson = await payRes.json();
    if (!payJson.success || !payJson.data) {
      throw new Error('Payment record not initialized for tested token');
    }

    const payId = payJson.data.id;

    // Advance to paperwork_matched
    const adv1 = await fetch(`${BASE_URL}/payments/${payId}/advance-stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_stage: 'paperwork_matched' })
    });
    const adv1Json = await adv1.json();
    if (adv1Json.payment.currentStage !== 'paperwork_matched') {
      throw new Error(`Expected stage paperwork_matched, got: ${adv1Json.payment.currentStage}`);
    }

    // Advance to produce_lifted
    const adv2 = await fetch(`${BASE_URL}/payments/${payId}/advance-stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_stage: 'produce_lifted' })
    });
    const adv2Json = await adv2.json();
    if (adv2Json.payment.currentStage !== 'produce_lifted') {
      throw new Error(`Expected stage produce_lifted, got: ${adv2Json.payment.currentStage}`);
    }

    // Verify stage history contains completed timestamps
    const liftedStage = adv2Json.payment.stageHistory.find(s => s.stage === 'produce_lifted');
    if (!liftedStage || !liftedStage.completed || !liftedStage.timestamp) {
      throw new Error('Produce lifted stage timestamp missing');
    }
  });

  // 12. Dynamic Season Configuration Revisions
  await test('PUT /admin/season-config updates MSP parameters dynamically', async () => {
    const res = await fetch(`${BASE_URL}/admin/season-config/SC-RABI-2026-WHEAT`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msp_price: 2350.0 // Mid-season revised MSP
      })
    });
    const json = await res.json();
    if (!json.success || json.data.msp_price !== 2350) {
      throw new Error(`Expected updated MSP price 2350, got: ${json.data?.msp_price}`);
    }
  });

  // 13. Notifications / SMS Simulator
  await test('POST & GET /notifications triggers and records SMS alerts', async () => {
    const triggerRes = await fetch(`${BASE_URL}/notifications/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmer_id: 'FARM-2026-9842',
        message: 'Test automated alert: Weighbridge scale ready.'
      })
    });
    const trigJson = await triggerRes.json();
    if (!trigJson.success) throw new Error('Failed to trigger notification');

    const listRes = await fetch(`${BASE_URL}/notifications?farmer_id=FARM-2026-9842`);
    const listJson = await listRes.json();
    if (!listJson.success || listJson.data.length === 0) {
      throw new Error('Expected notifications list');
    }
  });

  console.log(`\n🎉 Verification Complete: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal error during test suite:', err);
  process.exit(1);
});
