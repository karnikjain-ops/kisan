import React from 'react';
import { 
  Tractor, 
  PhoneCall, 
  Languages, 
  Sun, 
  Moon, 
  ShieldCheck,
  UserCheck,
  Building2,
  LogOut,
  User,
  ArrowRightLeft
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function Header({ 
  activeRole, 
  setActiveRole, 
  currentLang, 
  setCurrentLang, 
  theme, 
  setTheme,
  ticketCount,
  currentUser = { role: 'farmer', name: 'Rameshwar Singh', aadhaarLast4: '4821' },
  onOpenAuthModal
}) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Separate role-based navigation menus
  const farmerRoles = [
    { id: 'farmer', label: '🏠 Farmers Hub & Land Record' },
    { id: 'payment', label: '💳 DBT Payment Ledger' },
    { id: 'queue', label: '⏱️ Live Mandi Queue Status' },
    { id: 'ivr', label: '📞 Toll-Free Call Booking (155261)' },
    { id: 'sms', label: '📱 My SMS Alerts' }
  ];

  const officerRoles = [
    { id: 'officer', label: '🏬 Mandi Staff Console & Live Roster' },
    { id: 'analytics', label: '📊 APMC Congestion Analytics Hub' },
    { id: 'sms', label: '📢 Official SMS Gateway' }
  ];

  const currentNavItems = currentUser.role === 'farmer' ? farmerRoles : officerRoles;

  return (
    <header>
      {/* 1. Tricolor Top Accent Line */}
      <div className="top-tricolor" />

      {/* 2. Top Utility Bar */}
      <div className="top-utility-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>{t.govHeader}</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>{t.ministry}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fde047', fontWeight: 700 }}>
            <PhoneCall size={14} />
            <span>{t.helpline}</span>
          </div>

          {/* Prominent Hindi / English Language Switcher Button */}
          <button
            onClick={() => setCurrentLang(currentLang === 'en' ? 'hi' : 'en')}
            style={{
              background: '#ea580c',
              color: '#ffffff',
              border: '2px solid #ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              padding: '4px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Languages size={15} />
            <span>{currentLang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {theme === 'dark' ? <Sun size={14} color="#fde047" /> : <Moon size={14} color="#93c5fd" />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* 3. FasalExpress Brand Header with Role Badging */}
      <div className="gov-brand-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div 
                style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '14px', 
                  background: 'linear-gradient(135deg, #006837 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0, 104, 55, 0.4)'
                }}
              >
                <Tractor size={30} color="#ffffff" />
              </div>

              <div>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--gov-navy)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {t.portalTitle}
                  <span className="gov-badge badge-saffron">SIH 2026</span>
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                  {t.portalSub}
                </p>
              </div>
            </div>
          </div>

          {/* User Profile Pill & Role Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            {currentUser.role === 'farmer' ? (
              <div style={{ background: '#f0fdf4', border: '2px solid #16a34a', padding: '6px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#16a34a" />
                <div style={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                  <strong style={{ color: '#166534', display: 'block', fontWeight: 800 }}>
                    {currentUser.name} (Farmer)
                  </strong>
                  <span style={{ color: '#475569' }}>
                    ID: {currentUser.farmerId || 'FARM-9842'} • Aadhaar: •••• {currentUser.aadhaarLast4 || '4821'}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ background: '#eff6ff', border: '2px solid #2563eb', padding: '6px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={22} color="#2563eb" />
                <div style={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                  <strong style={{ color: '#1e40af', display: 'block', fontWeight: 800 }}>
                    {currentUser.name}
                  </strong>
                  <span style={{ color: '#475569' }}>
                    {currentUser.designation || 'APMC Superintendent'} • {currentUser.officerId || 'APMC Staff'}
                  </span>
                </div>
              </div>
            )}

            {/* Login / Register Modal Trigger */}
            <button
              onClick={onOpenAuthModal}
              className="btn-gov-primary"
              style={{ padding: '7px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, cursor: 'pointer' }}
              title="Sign in or register a new Farmer or Mandi Officer account"
            >
              <Key size={15} />
              <span>Login / Register</span>
            </button>

            {/* Switch Role Quick Button */}
            <button
              onClick={onOpenAuthModal}
              className="btn-gov-outline"
              style={{ padding: '7px 12px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, cursor: 'pointer' }}
              title="Switch user role"
            >
              <ArrowRightLeft size={15} />
              {currentUser.role === 'farmer' ? 'Staff Console' : 'Farmer Portal'}
            </button>

          </div>

        </div>
      </div>

      {/* 4. Role-Specific Navigation Bar */}
      <div className="gov-navbar">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto' }}>
          <nav style={{ display: 'flex', alignItems: 'center' }}>
            {currentNavItems.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`nav-link ${activeRole === role.id ? 'active' : ''}`}
              >
                {role.label}
              </button>
            ))}
          </nav>

          <div style={{ paddingRight: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {currentUser.role === 'farmer' && ticketCount > 0 && (
              <span className="gov-badge badge-saffron" style={{ animation: 'pulse-ring 2s infinite' }}>
                Token Pass Active
              </span>
            )}
            {currentUser.role === 'officer' && (
              <span className="gov-badge badge-green" style={{ background: '#ffffff', color: '#092543', fontWeight: 800 }}>
                🏬 APMC Officer Console
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Announcement Ticker Bar */}
      <div className="gov-ticker-bar">
        <span style={{ background: '#c2410c', color: '#fff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
          ANNOUNCEMENT / घोषणा
        </span>
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1, fontWeight: 700 }}>
          📢 <strong>FasalExpress Platform:</strong> Real-time Mandi Slot Booking & Token Registration open for Wheat (₹2,275/Qt) & Mustard (₹5,650/Qt). Dial Toll-Free 155261 for phone booking.
        </div>
      </div>
    </header>
  );
}
