import React from 'react';
import { 
  Tractor, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  MessageSquare, 
  Globe, 
  Sun, 
  Moon,
  Bell,
  PhoneCall,
  Sparkles,
  Search,
  Languages
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function Header({ 
  activeRole, 
  setActiveRole, 
  currentLang, 
  setCurrentLang, 
  theme, 
  setTheme,
  ticketCount 
}) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const roles = [
    { id: 'farmer', label: t.navHome },
    { id: 'payment', label: '💳 DBT Payment Ledger' },
    { id: 'ivr', label: '📞 Toll-Free Call Booking (155261)' },
    { id: 'queue', label: t.navQueue },
    { id: 'officer', label: t.navStaff },
    { id: 'analytics', label: t.navAnalytics },
    { id: 'sms', label: t.navSms }
  ];

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
              fontSize: '0.88rem',
              padding: '4px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}
          >
            <Languages size={16} />
            <span>{currentLang === 'en' ? 'हिंदी में बदलें (Change to Hindi)' : 'Switch to English'}</span>
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

      {/* 3. KisanQueue Custom Brand Header */}
      <div className="gov-brand-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* KisanQueue Custom Logo & Title */}
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

          {/* Language Toggle & Verification Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="btn-gov-saffron"
              onClick={() => setCurrentLang(currentLang === 'en' ? 'hi' : 'en')}
              style={{ fontSize: '0.95rem', padding: '10px 18px', fontWeight: 800 }}
            >
              <Languages size={18} />
              {currentLang === 'en' ? '🇮🇳 भाषा: हिंदी' : '🌐 Language: English'}
            </button>

            <div style={{ background: '#f8fafc', padding: '8px 14px', borderRadius: '8px', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={22} color="#006837" />
              <div style={{ fontSize: '0.78rem', lineHeight: 1.2 }}>
                <strong style={{ color: '#092543', display: 'block', fontWeight: 800 }}>FasalExpress Engine</strong>
                <span style={{ color: '#475569', fontWeight: 600 }}>Real-time Mandi Pass</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Main Navy Navigation Bar */}
      <div className="gov-navbar">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto' }}>
          <nav style={{ display: 'flex', alignItems: 'center' }}>
            {roles.map((role) => (
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
            {ticketCount > 0 && (
              <span className="gov-badge badge-saffron" style={{ animation: 'pulse-ring 2s infinite' }}>
                Token Pass Active
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
