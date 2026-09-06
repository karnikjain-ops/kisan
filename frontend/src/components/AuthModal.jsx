import React, { useState, useEffect } from 'react';
import { 
  User, 
  Key, 
  Building2, 
  ArrowRight, 
  X, 
  Sparkles, 
  Tractor, 
  FileCheck, 
  CreditCard, 
  BadgeCheck, 
  AlertCircle 
} from 'lucide-react';
import { registerFarmerApi, loginFarmerApi, registerOfficerApi, loginOfficerApi } from '../services/api';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  onRegisterSuccess,
  initialTab = 'farmer',
  initialMode = 'login'
}) {
  const [authMode, setAuthMode] = useState(initialMode); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState(initialTab); // 'farmer' or 'officer'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Farmer login state
  const [farmerPhone, setFarmerPhone] = useState('9812345678');
  const [farmerOtp, setFarmerOtp] = useState('4821');

  // Officer login state
  const [officerBadge, setOfficerBadge] = useState('APMC-KARNAL-402');
  const [officerPass, setOfficerPass] = useState('password123');

  // Farmer registration state
  const [fRegName, setFRegName] = useState('Sardar Baldev Singh');
  const [fRegPhone, setFRegPhone] = useState('9876543210');
  const [fRegAadhaar, setFRegAadhaar] = useState('583219482049');
  const [fRegVillage, setFRegVillage] = useState('Taraori');
  const [fRegDistrict, setFRegDistrict] = useState('Karnal');
  const [fRegZone, setFRegZone] = useState('ZONE-KARNAL-NORTH');
  const [fRegKhasra, setFRegKhasra] = useState('KH-88/19/1');
  const [fRegAcres, setFRegAcres] = useState('6.5');
  const [fRegCrop, setFRegCrop] = useState('wheat');
  const [fRegBank, setFRegBank] = useState('State Bank of India');
  const [fRegAccount, setFRegAccount] = useState('SBI A/C ending 2049');
  const [fRegIfsc, setFRegIfsc] = useState('SBIN0001234');

  // Officer registration state
  const [oRegName, setORegName] = useState('Smt. Priya Sharma');
  const [oRegBadge, setORegBadge] = useState('APMC-AMB-501');
  const [oRegEmail, setORegEmail] = useState('priya.sharma@haryana.gov.in');
  const [oRegPhone, setORegPhone] = useState('9811223344');
  const [oRegMandiId, setORegMandiId] = useState('mandi-3');
  const [oRegMandiName, setORegMandiName] = useState('Ambala City Procurement Hub');
  const [oRegDesignation, setORegDesignation] = useState('APMC Senior Procurement Superintendent');
  const [oRegPass, setORegPass] = useState('Pass@2026');

  if (!isOpen) return null;

  const handleFarmerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await loginFarmerApi(farmerPhone, farmerOtp);
      const user = res.user || {
        role: 'farmer',
        name: 'Rameshwar Singh',
        farmerId: 'FARM-2026-9842',
        phone: '+91 98123 45678',
        village: 'Taraori, Karnal',
        aadhaarLast4: '4821',
        bankAccount: 'SBI A/C ending 4821',
        ifsc: 'SBIN0001234',
        totalLandAcres: 8.5
      };
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOfficerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await loginOfficerApi(officerBadge, officerPass);
      const user = res.user || {
        role: 'officer',
        name: 'Insp. V. K. Sharma',
        officerId: officerBadge,
        mandiName: 'Karnal Central Procurement Mandi',
        mandiId: 'mandi-1',
        designation: 'APMC Senior Procurement Superintendent'
      };
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Officer login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFarmerRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        name: fRegName,
        phone: fRegPhone,
        aadhaar: fRegAadhaar,
        village: fRegVillage,
        district: fRegDistrict,
        assigned_zone_id: fRegZone,
        khasra: fRegKhasra,
        area_acres: parseFloat(fRegAcres) || 5.0,
        declared_crop: fRegCrop,
        bank_account: fRegAccount,
        ifsc: fRegIfsc
      };

      const res = await registerFarmerApi(payload);
      if (res && res.success) {
        const d = res.data;
        const newFarmerUser = {
          role: 'farmer',
          name: d.name,
          farmerId: d.farmerId,
          phone: d.phone,
          village: d.village,
          aadhaarLast4: d.aadhaarLast4,
          bankAccount: d.bankAccount,
          ifsc: d.ifsc,
          totalLandAcres: d.totalLandAcres,
          landRecord: d.landRecord
        };

        if (onRegisterSuccess) {
          onRegisterSuccess(newFarmerUser);
        } else {
          onLoginSuccess(newFarmerUser);
        }
        onClose();
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const handleOfficerRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        name: oRegName,
        badgeId: oRegBadge,
        email: oRegEmail,
        phone: oRegPhone,
        mandiId: oRegMandiId,
        mandiName: oRegMandiName,
        designation: oRegDesignation,
        password: oRegPass
      };

      const res = await registerOfficerApi(payload);
      if (res && res.success) {
        const officerUser = res.user;
        if (onRegisterSuccess) {
          onRegisterSuccess(officerUser);
        } else {
          onLoginSuccess(officerUser);
        }
        onClose();
      } else {
        setErrorMsg(res.message || 'Officer registration failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Officer registration error');
    } finally {
      setLoading(false);
    }
  };

  const fillFarmerDemo = () => {
    setFRegName('Sardar Baldev Singh');
    setFRegPhone('9876543210');
    setFRegAadhaar('583219482049');
    setFRegVillage('Taraori');
    setFRegDistrict('Karnal');
    setFRegZone('ZONE-KARNAL-NORTH');
    setFRegKhasra('KH-88/19/1');
    setFRegAcres('6.5');
    setFRegCrop('wheat');
    setFRegBank('State Bank of India');
    setFRegAccount('SBI A/C ending 2049');
    setFRegIfsc('SBIN0001234');
  };

  const fillOfficerDemo = () => {
    setORegName('Smt. Priya Sharma');
    setORegBadge('APMC-AMB-501');
    setORegEmail('priya.sharma@haryana.gov.in');
    setORegPhone('9811223344');
    setORegMandiId('mandi-3');
    setORegMandiName('Ambala City Procurement Hub');
    setORegDesignation('APMC Senior Procurement Superintendent');
    setORegPass('Pass@2026');
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: authMode === 'register' ? '680px' : '520px', 
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0, 
          overflow: 'hidden',
          borderRadius: '14px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
        }}
      >
        
        {/* Top Header Banner */}
        <div style={{ background: 'linear-gradient(135deg, #092543 0%, #0b4a8b 100%)', color: '#ffffff', padding: '20px 24px', position: 'relative' }}>
          <button 
            onClick={onClose}
            aria-label="Close authentication modal"
            style={{ 
              position: 'absolute', 
              top: '16px', 
              right: '16px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: 'none', 
              color: '#ffffff', 
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer' 
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="gov-badge badge-green" style={{ background: '#dcfce7', color: '#14532d', fontSize: '0.75rem', fontWeight: 800 }}>
              Official National MSP Procurement Portal
            </span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            {authMode === 'login' ? '🔐 FasalExpress Portal Authentication' : '📝 New Beneficiary & Staff Registration'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#e2e8f0', marginTop: '4px', marginBottom: 0 }}>
            {authMode === 'login' 
              ? 'Access your registered Farmer Dashboard or APMC Mandi Staff console.'
              : 'Register new farmer with Khasra land verification or onboard new APMC officer.'}
          </p>

          {/* Mode Switcher: Login vs Register Pills */}
          <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '8px', padding: '4px', marginTop: '14px', gap: '4px' }}>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                background: authMode === 'login' ? '#ffffff' : 'transparent',
                color: authMode === 'login' ? '#092543' : '#cbd5e1',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Key size={15} /> Sign In (लॉगिन)
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                background: authMode === 'register' ? '#ffffff' : 'transparent',
                color: authMode === 'register' ? '#006837' : '#cbd5e1',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <BadgeCheck size={15} /> New Registration (नया पंजीकरण)
            </button>
          </div>
        </div>

        {/* Role Toggle Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--gov-border)', background: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('farmer'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '12px 14px',
              fontWeight: 800,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'farmer' ? '#ffffff' : 'transparent',
              color: activeTab === 'farmer' ? '#006837' : '#64748b',
              borderBottom: activeTab === 'farmer' ? '3px solid #006837' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Tractor size={18} /> Farmer Beneficiary (किसान)
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab('officer'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '12px 14px',
              fontWeight: 800,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'officer' ? '#ffffff' : 'transparent',
              color: activeTab === 'officer' ? '#092543' : '#64748b',
              borderBottom: activeTab === 'officer' ? '3px solid #092543' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Building2 size={18} /> APMC Mandi Staff (अधिकारी)
          </button>
        </div>

        {/* Form Body with Scroll for Registration */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          
          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* =========================================================
              1. LOGIN MODE
             ========================================================= */}
          {authMode === 'login' && activeTab === 'farmer' && (
            <form onSubmit={handleFarmerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '6px' }}>
                  Aadhaar Linked Mobile Number / आधार से जुड़ा मोबाइल नंबर
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>+91</span>
                  <input 
                    type="tel" 
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="gov-input"
                    style={{ paddingLeft: '48px', fontWeight: 700 }}
                    required
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--gov-navy)' }}>
                    Enter 4-Digit OTP / ओटीपी दर्ज करें
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#006837', fontWeight: 700 }}>OTP Sent via SMS (4821)</span>
                </div>
                <input 
                  type="text" 
                  value={farmerOtp}
                  onChange={(e) => setFarmerOtp(e.target.value)}
                  className="gov-input"
                  style={{ letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 900, textAlign: 'center' }}
                  required
                />
              </div>

              {/* Fast 1-Click Demo Fill */}
              <button 
                type="button"
                onClick={() => {
                  setFarmerPhone('9812345678');
                  setFarmerOtp('4821');
                }}
                className="btn-gov-outline"
                style={{ fontSize: '0.82rem', padding: '8px', justifyContent: 'center', background: '#f0fdf4', color: '#166534', borderColor: '#86efac' }}
              >
                <Sparkles size={14} /> 1-Click Demo Fill: Rameshwar Singh (Taraori, Karnal)
              </button>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-gov-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem', fontWeight: 900, marginTop: '6px' }}
              >
                {loading ? 'Authenticating...' : <>Login as Farmer <ArrowRight size={18} /></>}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
                Not registered yet?{' '}
                <button 
                  type="button" 
                  onClick={() => setAuthMode('register')} 
                  style={{ background: 'transparent', border: 'none', color: '#006837', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Register New Farmer Beneficiary
                </button>
              </div>
            </form>
          )}

          {authMode === 'login' && activeTab === 'officer' && (
            <form onSubmit={handleOfficerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '6px' }}>
                  APMC Officer Employee ID / कर्मचारी आईडी
                </label>
                <input 
                  type="text" 
                  value={officerBadge}
                  onChange={(e) => setOfficerBadge(e.target.value)}
                  placeholder="e.g. APMC-KARNAL-402"
                  className="gov-input"
                  style={{ fontWeight: 800 }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '6px' }}>
                  Secure Password / पासवर्ड
                </label>
                <input 
                  type="password" 
                  value={officerPass}
                  onChange={(e) => setOfficerPass(e.target.value)}
                  className="gov-input"
                  style={{ fontWeight: 800 }}
                  required
                />
              </div>

              <button 
                type="button"
                onClick={() => {
                  setOfficerBadge('APMC-KARNAL-402');
                  setOfficerPass('password123');
                }}
                className="btn-gov-outline"
                style={{ fontSize: '0.82rem', padding: '8px', justifyContent: 'center', background: '#eff6ff', color: '#1e40af', borderColor: '#93c5fd' }}
              >
                <Sparkles size={14} /> 1-Click Demo Fill: Mandi Superintendent (Karnal Mandi)
              </button>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-gov-saffron" 
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem', fontWeight: 900, marginTop: '6px' }}
              >
                {loading ? 'Authenticating...' : <>Login to APMC Staff Console <ArrowRight size={18} /></>}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
                New APMC Officer?{' '}
                <button 
                  type="button" 
                  onClick={() => setAuthMode('register')} 
                  style={{ background: 'transparent', border: 'none', color: '#092543', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Register Officer Credentials
                </button>
              </div>
            </form>
          )}

          {/* =========================================================
              2. REGISTRATION MODE: FARMER BENEFICIARY
             ========================================================= */}
          {authMode === 'register' && activeTab === 'farmer' && (
            <form onSubmit={handleFarmerRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Demo Fill Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', border: '1px dashed #059669', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 700 }}>
                  ⚡ Quick Test: Pre-fill full verified farmer profile & land record
                </span>
                <button
                  type="button"
                  onClick={fillFarmerDemo}
                  className="btn-gov-outline"
                  style={{ fontSize: '0.78rem', padding: '4px 10px', background: '#ffffff', color: '#047857', borderColor: '#34d399', fontWeight: 800 }}
                >
                  <Sparkles size={13} /> 1-Click Demo Fill
                </button>
              </div>

              {/* Section 1: Personal & Aadhaar Identity */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#0f172a' }}>
                  <User size={16} color="#006837" />
                  <strong style={{ fontSize: '0.88rem' }}>1. Farmer Identity & Aadhaar (पहचान एवं आधार)</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Farmer Full Name / किसान का नाम *
                    </label>
                    <input 
                      type="text" 
                      value={fRegName}
                      onChange={(e) => setFRegName(e.target.value)}
                      placeholder="e.g. Sardar Baldev Singh"
                      className="gov-input"
                      style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Aadhaar Mobile Number / मोबाइल नंबर *
                    </label>
                    <input 
                      type="tel" 
                      value={fRegPhone}
                      onChange={(e) => setFRegPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      className="gov-input"
                      style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                      required
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                        12-Digit Aadhaar Number / आधार संख्या *
                      </label>
                      <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>✓ UIDAI Mock Verified</span>
                    </div>
                    <input 
                      type="text" 
                      value={fRegAadhaar}
                      onChange={(e) => setFRegAadhaar(e.target.value)}
                      placeholder="e.g. 5832 1948 2049"
                      className="gov-input"
                      style={{ fontSize: '0.88rem', padding: '8px 12px', letterSpacing: '2px', fontWeight: 800 }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Land Records (Khasra / Girdawari) */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#0f172a' }}>
                  <FileCheck size={16} color="#006837" />
                  <strong style={{ fontSize: '0.88rem' }}>2. Revenue Land Record & Khasra (खसरा एवं भूमि ब्योरा)</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Village / गाँव *
                    </label>
                    <input 
                      type="text" 
                      value={fRegVillage}
                      onChange={(e) => setFRegVillage(e.target.value)}
                      placeholder="e.g. Taraori"
                      className="gov-input"
                      style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      District / ज़िला *
                    </label>
                    <select 
                      value={fRegDistrict}
                      onChange={(e) => setFRegDistrict(e.target.value)}
                      className="gov-input"
                      style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                    >
                      <option value="Karnal">Karnal (करनाल)</option>
                      <option value="Kurukshetra">Kurukshetra (कुरुक्षेत्र)</option>
                      <option value="Ambala">Ambala (अम्बाला)</option>
                      <option value="Kaithal">Kaithal (कैथल)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Khasra / Survey No. / खसरा नं. *
                    </label>
                    <input 
                      type="text" 
                      value={fRegKhasra}
                      onChange={(e) => setFRegKhasra(e.target.value)}
                      placeholder="e.g. KH-88/19/1"
                      className="gov-input"
                      style={{ fontSize: '0.88rem', padding: '8px 12px', fontWeight: 800 }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Land Area (Acres) / एकड़ *
                    </label>
                    <input 
                      type="number" 
                      step="0.5"
                      min="0.5"
                      max="100"
                      value={fRegAcres}
                      onChange={(e) => setFRegAcres(e.target.value)}
                      className="gov-input"
                      style={{ fontSize: '0.88rem', padding: '8px 12px', fontWeight: 800 }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Certified MSP Crop / फसल *
                    </label>
                    <select 
                      value={fRegCrop}
                      onChange={(e) => setFRegCrop(e.target.value)}
                      className="gov-input"
                      style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                    >
                      <option value="wheat">Wheat (गेहूँ) - ₹2,275/Qt</option>
                      <option value="mustard">Mustard (सरसों) - ₹5,650/Qt</option>
                      <option value="paddy">Paddy Grade A (धान) - ₹2,203/Qt</option>
                      <option value="chana">Gram / Chana (चना) - ₹5,440/Qt</option>
                      <option value="maize">Maize (मक्का) - ₹2,090/Qt</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Jurisdiction Revenue Zone *
                    </label>
                    <select 
                      value={fRegZone}
                      onChange={(e) => setFRegZone(e.target.value)}
                      className="gov-input"
                      style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                    >
                      <option value="ZONE-KARNAL-NORTH">ZONE-KARNAL-NORTH (Karnal Mandi)</option>
                      <option value="ZONE-KURUKSHETRA-SOUTH">ZONE-KURUKSHETRA-SOUTH (Kurukshetra Mandi)</option>
                      <option value="ZONE-AMBALA-CENTRAL">ZONE-AMBALA-CENTRAL (Ambala Hub)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: DBT Bank Account */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#0f172a' }}>
                  <CreditCard size={16} color="#006837" />
                  <strong style={{ fontSize: '0.88rem' }}>3. Direct Benefit Transfer (DBT) Bank Account (बैंक खाता)</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Bank Name / बैंक का नाम
                    </label>
                    <input 
                      type="text" 
                      value={fRegBank}
                      onChange={(e) => setFRegBank(e.target.value)}
                      className="gov-input"
                      style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Bank Account / खाता संख्या *
                    </label>
                    <input 
                      type="text" 
                      value={fRegAccount}
                      onChange={(e) => setFRegAccount(e.target.value)}
                      className="gov-input"
                      style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      IFSC Code / आईएफएससी कोड *
                    </label>
                    <input 
                      type="text" 
                      value={fRegIfsc}
                      onChange={(e) => setFRegIfsc(e.target.value)}
                      className="gov-input"
                      style={{ fontSize: '0.88rem', padding: '8px 12px', fontWeight: 700 }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="btn-gov-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.05rem', fontWeight: 900 }}
              >
                {loading ? 'Registering Farmer Profile...' : <>🌾 Register Farmer Profile & Land Record <ArrowRight size={18} /></>}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
                Already registered?{' '}
                <button 
                  type="button" 
                  onClick={() => setAuthMode('login')} 
                  style={{ background: 'transparent', border: 'none', color: '#006837', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Sign In to Existing Account
                </button>
              </div>

            </form>
          )}

          {/* =========================================================
              3. REGISTRATION MODE: APMC MANDI OFFICER
             ========================================================= */}
          {authMode === 'register' && activeTab === 'officer' && (
            <form onSubmit={handleOfficerRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Demo Fill Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', border: '1px dashed #3b82f6', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 700 }}>
                  ⚡ Quick Test: Pre-fill APMC Mandi Officer credentials
                </span>
                <button
                  type="button"
                  onClick={fillOfficerDemo}
                  className="btn-gov-outline"
                  style={{ fontSize: '0.78rem', padding: '4px 10px', background: '#ffffff', color: '#1d4ed8', borderColor: '#93c5fd', fontWeight: 800 }}
                >
                  <Sparkles size={13} /> 1-Click Demo Fill
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Officer Full Name / अधिकारी का नाम *
                  </label>
                  <input 
                    type="text" 
                    value={oRegName}
                    onChange={(e) => setORegName(e.target.value)}
                    placeholder="e.g. Smt. Priya Sharma"
                    className="gov-input"
                    style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    APMC Employee Badge ID *
                  </label>
                  <input 
                    type="text" 
                    value={oRegBadge}
                    onChange={(e) => setORegBadge(e.target.value)}
                    placeholder="e.g. APMC-AMB-501"
                    className="gov-input"
                    style={{ fontSize: '0.88rem', padding: '8px 12px', fontWeight: 800 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Official Govt Email (.gov.in) *
                  </label>
                  <input 
                    type="email" 
                    value={oRegEmail}
                    onChange={(e) => setORegEmail(e.target.value)}
                    placeholder="officer@haryana.gov.in"
                    className="gov-input"
                    style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Official Mobile Number *
                  </label>
                  <input 
                    type="tel" 
                    value={oRegPhone}
                    onChange={(e) => setORegPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="gov-input"
                    style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                    required
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Assigned Mandi Center / आवंटित मंडी केंद्र *
                  </label>
                  <select 
                    value={oRegMandiId}
                    onChange={(e) => {
                      setORegMandiId(e.target.value);
                      if (e.target.value === 'mandi-1') setORegMandiName('Karnal Central Procurement Mandi');
                      else if (e.target.value === 'mandi-2') setORegMandiName('Kurukshetra Grain Market (APMC)');
                      else setORegMandiName('Ambala City Procurement Hub');
                    }}
                    className="gov-input"
                    style={{ fontSize: '0.88rem', padding: '8px 12px', fontWeight: 700 }}
                  >
                    <option value="mandi-1">Karnal Central Procurement Mandi (Karnal, Haryana)</option>
                    <option value="mandi-2">Kurukshetra Grain Market (Kurukshetra, Haryana)</option>
                    <option value="mandi-3">Ambala City Procurement Hub (Ambala, Haryana)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Designation / पदनाम *
                  </label>
                  <select 
                    value={oRegDesignation}
                    onChange={(e) => setORegDesignation(e.target.value)}
                    className="gov-input"
                    style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                  >
                    <option value="APMC Senior Procurement Superintendent">APMC Senior Procurement Superintendent</option>
                    <option value="Quality Testing Lab Officer">Quality Testing Lab Officer</option>
                    <option value="Weighbridge & Yard Inspector">Weighbridge & Yard Inspector</option>
                    <option value="DBT Accounts Verification Officer">DBT Accounts Verification Officer</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Set Password / पासवर्ड बनाएं *
                  </label>
                  <input 
                    type="password" 
                    value={oRegPass}
                    onChange={(e) => setORegPass(e.target.value)}
                    className="gov-input"
                    style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-gov-saffron" 
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.05rem', fontWeight: 900 }}
              >
                {loading ? 'Registering Staff...' : <>🏬 Register APMC Mandi Staff <ArrowRight size={18} /></>}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
                Already registered?{' '}
                <button 
                  type="button" 
                  onClick={() => setAuthMode('login')} 
                  style={{ background: 'transparent', border: 'none', color: '#092543', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Sign In with Employee ID
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
