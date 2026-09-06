import React, { useState } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  Play, 
  Pause, 
  Users, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Bell,
  Lock,
  Layers
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function MandiOfficerDashboard({ 
  tickets, 
  onAdvanceQueue, 
  onSendSms,
  currentLang = 'en'
}) {
  const [gatePaused, setGatePaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const filteredTickets = tickets.filter(tk => 
    tk.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tk.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const slotLocks = [
    { window: '08:00 AM - 10:00 AM', booked: 14, max: 15, isFull: false, subSlot: '15-min micro-window active' },
    { window: '10:00 AM - 01:00 PM', booked: 15, max: 15, isFull: true, subSlot: 'LOCKED - Prevents Herding Jam' },
    { window: '01:00 PM - 03:00 PM', booked: 6, max: 15, isFull: false, subSlot: '15-min micro-window active' },
    { window: '03:00 PM - 06:00 PM', booked: 3, max: 15, isFull: false, subSlot: '15-min micro-window active' }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Top High-Contrast Officer Header */}
      <div 
        className="gov-card" 
        style={{ 
          padding: '28px', 
          marginBottom: '28px',
          background: 'linear-gradient(135deg, #092543 0%, #0b4a8b 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="gov-badge badge-green" style={{ background: '#dcfce7', color: '#14532d' }}>🏬 APMC Mandi Staff Console</span>
            <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>Center: Karnal Central Mandi</span>
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff' }}>
            {t.staffTitle}
          </h2>
          <p style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 500, marginTop: '4px' }}>
            {t.staffSub}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn-gov-saffron" 
            onClick={onAdvanceQueue}
            style={{ padding: '14px 24px', fontSize: '1.05rem', fontWeight: 800, border: '2px solid #ffffff' }}
          >
            <Play size={20} /> {t.callNext}
          </button>
          
          <button 
            className={gatePaused ? 'btn-gov-primary' : 'btn-gov-outline'}
            onClick={() => {
              setGatePaused(!gatePaused);
              onSendSms({
                id: `sms-${Date.now()}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'GATE_PAUSE',
                title: gatePaused ? '🟢 Gate Resumed' : '🔴 Gate Flow Paused',
                message: gatePaused 
                  ? 'FasalExpress Alert: Gate entry resumed at Karnal Mandi.' 
                  : 'FasalExpress Alert: Gate entry temporarily paused for 15 mins due to inner yard traffic.'
              });
            }}
            style={{ padding: '14px 24px', fontSize: '1.05rem', fontWeight: 800 }}
          >
            {gatePaused ? <Play size={20} /> : <Pause size={20} />}
            {gatePaused ? t.resumeGate : t.pauseGate}
          </button>
        </div>
      </div>

      {/* ANTI-HERDING SLOT THRESHOLD & CAPACITY MONITOR CARD */}
      <div className="gov-card" style={{ marginBottom: '28px' }}>
        <div className="gov-card-header green">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
            <Layers size={20} /> Smart Anti-Herding Capacity Threshold Monitor (एंटी-भीड़ प्रबंधन)
          </span>
          <span className="gov-badge badge-green" style={{ background: '#ffffff', color: '#006837', fontWeight: 800 }}>
            15 Trucks/Slot Cap
          </span>
        </div>

        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '18px', fontWeight: 600 }}>
            Automated hard capacity limits preventing farmers from overbooking quiet time slots simultaneously:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {slotLocks.map((slot, i) => (
              <div 
                key={i}
                style={{
                  background: slot.isFull ? '#fee2e2' : 'var(--gov-bg)',
                  border: slot.isFull ? '2px solid #ef4444' : '2px solid var(--gov-border)',
                  borderRadius: '12px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: slot.isFull ? '#991b1b' : 'var(--gov-navy)' }}>{slot.window}</span>
                  {slot.isFull ? (
                    <span className="gov-badge badge-saffron" style={{ background: '#ef4444', color: '#fff' }}>
                      <Lock size={12} /> LOCKED
                    </span>
                  ) : (
                    <span className="gov-badge badge-green">{slot.booked}/{slot.max} Booked</span>
                  )}
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.15)', borderRadius: '4px', overflow: 'hidden', margin: '8px 0' }}>
                  <div style={{ width: `${(slot.booked / slot.max) * 100}%`, height: '100%', background: slot.isFull ? '#ef4444' : '#006837' }} />
                </div>
                <span style={{ fontSize: '0.82rem', color: slot.isFull ? '#991b1b' : 'var(--text-muted)', fontWeight: 700 }}>{slot.subSlot}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Roster Table in High-Contrast White Card */}
      <div className="gov-card">
        <div className="gov-card-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
            <Users size={20} /> {t.rosterTitle}
          </span>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search Token / Farmer Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gov-input"
              style={{ paddingLeft: '38px', fontSize: '0.9rem', height: '38px' }}
            />
          </div>
        </div>

        <div style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '3px solid var(--gov-border)', color: 'var(--text-primary)', background: 'var(--gov-bg)' }}>
                <th style={{ padding: '14px', fontWeight: 800 }}>{t.tokenCol}</th>
                <th style={{ padding: '14px', fontWeight: 800 }}>{t.farmerCol}</th>
                <th style={{ padding: '14px', fontWeight: 800 }}>{t.cropCol}</th>
                <th style={{ padding: '14px', fontWeight: 800 }}>Time Window & Micro-Slot</th>
                <th style={{ padding: '14px', fontWeight: 800 }}>{t.stageCol}</th>
                <th style={{ padding: '14px', fontWeight: 800 }}>{t.actionCol}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((tk) => (
                <tr key={tk.tokenId} style={{ borderBottom: '1px solid var(--gov-border)' }}>
                  <td style={{ padding: '16px 14px', fontWeight: 900, color: 'var(--gov-navy)', fontSize: '1.1rem' }}>
                    #{tk.tokenId}
                  </td>
                  <td style={{ padding: '16px 14px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{tk.farmerName}</div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{tk.phone}</span>
                  </td>
                  <td style={{ padding: '16px 14px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{tk.cropName}</span>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gov-saffron)', fontWeight: 700 }}>{tk.quantityQuintals} Quintals</div>
                  </td>
                  <td style={{ padding: '16px 14px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{tk.timeWindow}</div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gov-green)', fontWeight: 700 }}>Staggered: {tk.staggeredGateTime || '10:15 AM'}</span>
                  </td>
                  <td style={{ padding: '16px 14px' }}>
                    <span className="gov-badge badge-saffron">{tk.status}</span>
                  </td>
                  <td style={{ padding: '16px 14px' }}>
                    <button 
                      className="btn-gov-outline" 
                      onClick={onAdvanceQueue}
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      Advance Stage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
