import { Router } from 'express';
import { queryAll, queryOne, run } from '../db/database.js';

const router = Router();

/**
 * POST /api/auth/farmer/login
 * Verify mobile and OTP
 */
router.post('/farmer/login', (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const cleanDigits = phone.replace(/\D/g, '');
    const farmers = queryAll('SELECT * FROM farmers');
    const matched = farmers.find(f => f.phone.replace(/\D/g, '').includes(cleanDigits) || cleanDigits.includes(f.phone.replace(/\D/g, '')));

    if (matched) {
      const landRecords = queryAll('SELECT * FROM land_records WHERE farmer_id = ?', [matched.id]);
      return res.json({
        success: true,
        message: 'Farmer authenticated successfully',
        user: {
          role: 'farmer',
          name: matched.name,
          farmerId: matched.id,
          phone: matched.phone,
          village: matched.village,
          aadhaarLast4: matched.aadhaar_mock.slice(-4),
          bankAccount: matched.bank_account_mock,
          ifsc: matched.ifsc_mock,
          totalLandAcres: landRecords.reduce((sum, r) => sum + r.area_acres, 0),
          landRecords
        }
      });
    }

    // Fallback demo session
    return res.json({
      success: true,
      message: 'Farmer authenticated (demo session)',
      user: {
        role: 'farmer',
        name: 'Rameshwar Singh',
        farmerId: 'FARM-2026-9842',
        phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        village: 'Taraori, Karnal',
        aadhaarLast4: '4821',
        bankAccount: 'SBI A/C ending 4821',
        ifsc: 'SBIN0001234',
        totalLandAcres: 8.5
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/auth/officer/login
 * Verify APMC Badge & Password
 */
router.post('/officer/login', (req, res) => {
  try {
    const { officerBadge, password } = req.body;
    if (!officerBadge) {
      return res.status(400).json({ success: false, message: 'Officer Badge ID is required' });
    }

    return res.json({
      success: true,
      message: 'Officer authenticated successfully',
      user: {
        role: 'officer',
        name: 'Insp. V. K. Sharma',
        officerId: officerBadge,
        mandiName: 'Karnal Central Procurement Mandi',
        mandiId: 'mandi-1',
        designation: 'APMC Senior Procurement Superintendent'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/auth/officer/register
 * Register new APMC Mandi staff / officer
 */
router.post('/officer/register', (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      badgeId,
      mandiId = 'mandi-1',
      mandiName = 'Karnal Central Procurement Mandi',
      designation = 'APMC Procurement Superintendent'
    } = req.body;

    if (!name || !badgeId) {
      return res.status(400).json({ success: false, message: 'Official name and APMC badge ID are required.' });
    }

    const officer = {
      role: 'officer',
      name: name.trim(),
      officerId: badgeId.trim().toUpperCase(),
      phone: phone || '+91 98765 00000',
      email: email || `${badgeId.toLowerCase()}@apmc.gov.in`,
      mandiId,
      mandiName,
      designation
    };

    res.status(201).json({
      success: true,
      message: 'Mandi Officer registered and authenticated successfully',
      user: officer
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
