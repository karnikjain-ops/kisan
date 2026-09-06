import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Key, 
  Phone, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Lock,
  Sparkles,
  Tractor
} from 'lucide-react';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess 
}) {
  const [activeTab, setActiveTab] = useState('farmer'); // 'farmer' or 'officer'
  
  // Farmer login state
  const [farmerPhone, setFarmerPhone] = useState('9812345678');
  const [farmerOtp, setFarmerOtp] = useState('4821');
  const [otpSent, setOtpSent] = useState(true);

  // Officer login state
  const [officerBadge, setOfficerBadge] = useState('APMC-KARNAL-402');
  const [officerPass, setOfficerPass] = useState('••••••••');

  if (!isOpen) return null;

  const handleFarmerLogin = (e) => {
    e.preventDefault();
    onLoginSuccess({
      role: 'farmer',
      name: 'Rameshwar Singh',
      farmerId: 'FARM-2026-9842',
      phone: '+91 98123 45678',
      village: 'Taraori, Karnal',
      aadhaarLast4: '4821',
      bankAccount: 'SBI A/C ending 4821',
      ifsc: 'SBIN0001234',
      totalLandAcres: 8.5
    });
    onClose();
  };

  const handleOfficerLogin = (e) => {
    e.preventDefault();
    onLoginSuccess({
      role: 'officer',
      name: 'Insp. V. K. Sharma',
      officerId: officerBadge,
      mandiName: 'Karnal Central Procurement Mandi',
      mandiId: 'mandi-1',
      designation: 'APMC Senior Procurement Superintendent'
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px', padding: '0', overflow: 'hidden' }}>
        
        {/* Modal Top Banner */}
        <div style={{ background: 'linear-gradient(135deg, #092543 0%, #0b4a8b 100%)', color: '#ffffff', padding: '24px', position: 'relative' }}>
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>

          <span className="gov-badge badge-green" style={{ background: '#dcfce7', color: '#14532d', fontSize: '0.78rem', marginBottom: '8px' }}>
            Official Portal Authentication
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
            FasalExpress Portal Login
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#f8fafc', marginTop: '4px' }}>
            Separate role-based portals for Registered Farmers and APMC Mandi Officers.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--gov-border)', background: '#f8fafc' }}>
          <button
            onClick={() => setActiveTab('farmer')}
            style={{
              flex: 1,
              padding: '14px',
              fontWeight: 800,
              fontSize: '0.92rem',
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
            onClick={() => setActiveTab('officer')}
            style={{
              flex: 1,
              padding: '14px',
              fontWeight: 800,
              fontSize: '0.92rem',
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

        {/* Form Body */}
        <div style={{ padding: '24px' }}>
          
          {/* FARMER LOGIN FORM */}
          {activeTab === 'farmer' && (
            <form onSubmit={handleFarmerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '6px' }}>
                  Aadhaar Linked Mobile Number / आधार से जुड़ा मोबाइल नंबर
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>+91</span>
                  <input 
                    type="tel" 
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    placeholder="Enter 10-digit phone"
                    className="gov-input"
                    style={{ paddingLeft: '48px', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gov-navy)' }}>
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
                className="btn-gov-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.05rem', fontWeight: 900, marginTop: '8px' }}
              >
                Login as Farmer <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* OFFICER LOGIN FORM */}
          {activeTab === 'officer' && (
            <form onSubmit={handleOfficerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '6px' }}>
                  APMC Officer Employee ID / कर्मचारी आईडी
                </label>
                <input 
                  type="text" 
                  value={officerBadge}
                  onChange={(e) => setOfficerBadge(e.target.value)}
                  placeholder="e.g. APMC-KARNAL-402"
                  className="gov-input"
                  style={{ fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '6px' }}>
                  Secure Password / पासवर्ड
                </label>
                <input 
                  type="password" 
                  value={officerPass}
                  onChange={(e) => setOfficerPass(e.target.value)}
                  className="gov-input"
                  style={{ fontWeight: 800 }}
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
                className="btn-gov-saffron" 
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.05rem', fontWeight: 900, marginTop: '8px' }}
              >
                Login to APMC Staff Console <ArrowRight size={18} />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
