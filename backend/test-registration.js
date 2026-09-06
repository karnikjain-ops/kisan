import express from 'express';
import { queryAll, queryOne, run } from './src/db/database.js';
import farmerRoutes from './src/routes/farmers.js';
import authRoutes from './src/routes/auth.js';

const app = express();
app.use(express.json());
app.use('/api/farmers', farmerRoutes);
app.use('/api/auth', authRoutes);

const server = app.listen(5099, async () => {
  console.log('🧪 Running Kisan Registration & Auth Test Suite on port 5099...');
  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Onboard new farmer with land record
    const farmerPayload = {
      name: 'Sardar Baldev Singh',
      phone: '9876543210',
      aadhaar: '583219482049',
      village: 'Taraori',
      district: 'Karnal',
      assigned_zone_id: 'ZONE-KARNAL-NORTH',
      khasra: 'KH-88/19/1',
      area_acres: 6.5,
      declared_crop: 'wheat',
      bank_account: 'SBI A/C ending 2049',
      ifsc: 'SBIN0001234'
    };

    const onboardRes = await fetch('http://localhost:5099/api/farmers/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmerPayload)
    });
    const onboardData = await onboardRes.json();

    if (onboardData.success && onboardData.data.farmerId && onboardData.data.totalLandAcres === 6.5) {
      console.log('✅ PASS: Farmer Onboard API created profile and land record:', onboardData.data.farmerId);
      passed++;
    } else {
      console.error('❌ FAIL: Farmer Onboard API failed:', onboardData);
      failed++;
    }

    // Test 2: Check database directly
    const savedFarmer = queryOne('SELECT * FROM farmers WHERE id = ?', [onboardData.data.farmerId]);
    const savedLand = queryOne('SELECT * FROM land_records WHERE farmer_id = ?', [onboardData.data.farmerId]);
    if (savedFarmer && savedLand && savedLand.area_acres === 6.5) {
      console.log('✅ PASS: Database verification passed for new farmer and Khasra record.');
      passed++;
    } else {
      console.error('❌ FAIL: Database verification failed');
      failed++;
    }

    // Test 3: Farmer Login
    const loginRes = await fetch('http://localhost:5099/api/auth/farmer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210', otp: '4821' })
    });
    const loginData = await loginRes.json();
    if (loginData.success && loginData.user.name === 'Sardar Baldev Singh') {
      console.log('✅ PASS: Farmer Login returned newly registered profile:', loginData.user.name);
      passed++;
    } else {
      console.error('❌ FAIL: Farmer Login failed:', loginData);
      failed++;
    }

    // Test 4: Officer Registration
    const officerPayload = {
      name: 'Smt. Priya Sharma',
      badgeId: 'APMC-AMB-501',
      email: 'priya.sharma@haryana.gov.in',
      phone: '9811223344',
      mandiId: 'mandi-3',
      mandiName: 'Ambala City Procurement Hub',
      designation: 'APMC Senior Procurement Superintendent',
      password: 'Pass@2026'
    };
    const offRegRes = await fetch('http://localhost:5099/api/auth/officer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(officerPayload)
    });
    const offRegData = await offRegRes.json();
    if (offRegData.success && offRegData.user.officerId === 'APMC-AMB-501') {
      console.log('✅ PASS: Officer Registration API succeeded:', offRegData.user.officerId);
      passed++;
    } else {
      console.error('❌ FAIL: Officer Registration failed:', offRegData);
      failed++;
    }

    // Test 5: Officer Login
    const offLogRes = await fetch('http://localhost:5099/api/auth/officer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerBadge: 'APMC-AMB-501', password: 'Pass@2026' })
    });
    const offLogData = await offLogRes.json();
    if (offLogData.success) {
      console.log('✅ PASS: Officer Login succeeded.');
      passed++;
    } else {
      console.error('❌ FAIL: Officer Login failed');
      failed++;
    }

    console.log(`\n🎉 Results: ${passed} passed, ${failed} failed.`);
    setTimeout(() => {
      server.close(() => process.exit(failed > 0 ? 1 : 0));
    }, 100);
  } catch (err) {
    console.error('💥 Test suite runtime error:', err);
    process.exit(1);
  }
});
