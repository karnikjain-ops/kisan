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
  Layers,
  FlaskConical,
  Scale,
  X,
  Sparkles,
  ArrowRight
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
  const [selectedTicketForQc, setSelectedTicketForQc] = useState(null);

  // Quality check modal state
  const [moistureInput, setMoistureInput] = useState(11.5);
  const [foreignMatterInput, setForeignMatterInput] = useState(0.5);
  const [grossWeightInput, setGrossWeightInput] = useState(4720);
  const [tareWeightInput, setTareWeightInput] = useState(220);
  const [qcSubmittedResult, setQcSubmittedResult] = useState(null);

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

  // Real-time calculation of 3 outcomes for modal preview
  const netWeightKg = Math.max(0, grossWeightInput - tareWeightInput);
  const netQuintals = netWeightKg / 100;
  const baseMsp = 2275;
  let qcOutcome = 'PASS';
  let discountPerQt = 0;
  let finalRatePerQt = baseMsp;

  if (moistureInput > 14.0) {
    qcOutcome = 'FAIL';
    finalRatePerQt = 0;
  } else if (moistureInput > 12.0) {
    qcOutcome = 'DISCOUNT';
    discountPerQt = Math.round((moistureInput - 12.0) * 25);
    finalRatePerQt = baseMsp - discountPerQt;
  }
  const calculatedTotalPayout = qcOutcome === 'FAIL' ? 0 : Math.round(netQuintals * finalRatePerQt);

  const handleOpenQcModal = (tk) => {
    setSelectedTicketForQc(tk);
    setMoistureInput(11.5);
    setGrossWeightInput(tk.quantityQuintals * 100 + 220);
    setTareWeightInput(220);
    setQcSubmittedResult(null);
  };

  const handleSaveQualityCheck = () => {
    const result = {
      outcome: qcOutcome,
      moisture: moistureInput,
      discountPerQt,
      finalRatePerQt,
      totalPayout: calculatedTotalPayout,
      receiptNo: `JFORM-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setQcSubmittedResult(result);

    // Trigger SMS to Farmer
    const smsMsg = qcOutcome === 'FAIL'
      ? `FasalExpress Rejection Alert: Crop rejected for Token #${selectedTicketForQc.tokenId}. Reason: Moisture content ${moistureInput}% exceeds statutory safety ceiling of 14.0%.`
      : qcOutcome === 'DISCOUNT'
      ? `FasalExpress Alert: Moisture tested at ${moistureInput}%. FAQ Deduction applied: ₹${discountPerQt}/Qt. Final MSP: ₹${finalRatePerQt}/Qt. Total: ₹${calculatedTotalPayout.toLocaleString('en-IN')}. J-Form #${result.receiptNo}.`
      : `FasalExpress Alert: Quality Verified (Grade A Superfine). Moisture ${moistureInput}% within 12% limit. Full MSP @ ₹${finalRatePerQt}/Qt. Total: ₹${calculatedTotalPayout.toLocaleString('en-IN')}. J-Form #${result.receiptNo}.`;

    onSendSms({
      id: `sms-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: qcOutcome === 'FAIL' ? 'QUALITY_REJECTION' : 'QUALITY_RESULT',
      title: qcOutcome === 'FAIL' ? '❌ Produce Rejected' : '🌾 Quality Verified',
      message: smsMsg
    });
  };

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
            <span className="gov-badge badge-green" style={{ background: '#dcfce7', color: '#14532d' }}>
              🏬 APMC Mandi Staff Console
            </span>
            <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
              Center: Karnal Central Mandi
            </span>
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
                <th style={{ padding: '14px', fontWeight: 800 }}>Operational Actions</th>
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
                    <span className={`gov-badge ${tk.status === 'REJECTED' ? 'badge-saffron' : 'badge-green'}`} style={{ background: tk.status === 'REJECTED' ? '#fee2e2' : undefined, color: tk.status === 'REJECTED' ? '#991b1b' : undefined }}>
                      {tk.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 14px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        className="btn-gov-primary" 
                        onClick={() => handleOpenQcModal(tk)}
                        style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FlaskConical size={14} /> Quality Lab Test
                      </button>
                      <button 
                        className="btn-gov-outline" 
                        onClick={onAdvanceQueue}
                        style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                      >
                        Advance Lane
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-OUTCOME QUALITY TESTING MODAL (Domain Rule Demonstration) */}
      {selectedTicketForQc && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', maxWidth: '640px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid var(--gov-border)' }}>
              <div>
                <span className="gov-badge badge-green" style={{ fontSize: '0.78rem' }}>APMC Statutory Lab Analysis</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gov-navy)', marginTop: '4px' }}>
                  Quality Inspection — Token #{selectedTicketForQc.tokenId}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTicketForQc(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={24} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Farmer: <strong>{selectedTicketForQc.farmerName}</strong> • Crop: <strong>{selectedTicketForQc.cropName}</strong> ({selectedTicketForQc.quantityQuintals} Quintals declared).
            </p>

            {/* Quick Testing Preset Chips */}
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '6px' }}>
                Test Simulation Presets:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  className="btn-gov-outline" 
                  onClick={() => { setMoistureInput(11.2); setForeignMatterInput(0.4); }}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', background: moistureInput === 11.2 ? '#dcfce7' : '#fff' }}
                >
                  🟢 Outcome 1: Pass (11.2% Moisture)
                </button>
                <button 
                  className="btn-gov-outline" 
                  onClick={() => { setMoistureInput(13.0); setForeignMatterInput(0.6); }}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', background: moistureInput === 13.0 ? '#fef3c7' : '#fff' }}
                >
                  🟡 Outcome 2: Marginal Discount (13.0%)
                </button>
                <button 
                  className="btn-gov-outline" 
                  onClick={() => { setMoistureInput(16.5); setForeignMatterInput(0.8); }}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', background: moistureInput === 16.5 ? '#fee2e2' : '#fff' }}
                >
                  🔴 Outcome 3: Hard Reject (16.5%)
                </button>
              </div>
            </div>

            {/* Form Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>
                  Moisture Content (% आर्द्रता)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={moistureInput}
                  onChange={(e) => setMoistureInput(parseFloat(e.target.value) || 0)}
                  className="gov-input"
                  style={{ fontWeight: 800 }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Base Limit: 12.0% | Ceiling: 14.0%</span>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>
                  Foreign Matter (% बाह्य पदार्थ)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={foreignMatterInput}
                  onChange={(e) => setForeignMatterInput(parseFloat(e.target.value) || 0)}
                  className="gov-input"
                  style={{ fontWeight: 800 }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Max Ceiling: 2.0%</span>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>
                  Gross Weight (Kg)
                </label>
                <input 
                  type="number" 
                  value={grossWeightInput}
                  onChange={(e) => setGrossWeightInput(parseFloat(e.target.value) || 0)}
                  className="gov-input"
                  style={{ fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '4px' }}>
                  Tare Weight (Kg)
                </label>
                <input 
                  type="number" 
                  value={tareWeightInput}
                  onChange={(e) => setTareWeightInput(parseFloat(e.target.value) || 0)}
                  className="gov-input"
                  style={{ fontWeight: 800 }}
                />
              </div>
            </div>

            {/* LIVE OUTCOME COMPUTATION CARD */}
            <div style={{ 
              padding: '14px', 
              borderRadius: '10px', 
              marginBottom: '20px',
              background: qcOutcome === 'PASS' ? '#f0fdf4' : qcOutcome === 'DISCOUNT' ? '#fffbeb' : '#fef2f2',
              border: `2px solid ${qcOutcome === 'PASS' ? '#16a34a' : qcOutcome === 'DISCOUNT' ? '#f59e0b' : '#ef4444'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', color: qcOutcome === 'PASS' ? '#166534' : qcOutcome === 'DISCOUNT' ? '#92400e' : '#991b1b' }}>
                  Evaluation Result: {qcOutcome === 'PASS' ? '✓ PASS (Full MSP)' : qcOutcome === 'DISCOUNT' ? '⚠ MARGINAL (Discounted Payout)' : '✗ REJECTED (Over Ceiling)'}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Net: {netQuintals} Quintals</span>
              </div>

              {qcOutcome === 'PASS' && (
                <p style={{ fontSize: '0.82rem', color: '#166534', margin: 0 }}>
                  Moisture is within statutory base limit of 12.0%. Procured at <strong>100% full MSP rate of ₹{baseMsp}/Qt</strong>.
                </p>
              )}

              {qcOutcome === 'DISCOUNT' && (
                <p style={{ fontSize: '0.82rem', color: '#92400e', margin: 0 }}>
                  Moisture {moistureInput}% exceeds 12.0% base. Statutory deduction of <strong>₹{discountPerQt}/Qt</strong> applied. Net Rate: <strong>₹{finalRatePerQt}/Qt</strong>.
                </p>
              )}

              {qcOutcome === 'FAIL' && (
                <p style={{ fontSize: '0.82rem', color: '#991b1b', margin: 0 }}>
                  Moisture {moistureInput}% exceeds APMC safety ceiling of 14.0%. <strong>Produce rejected at gate. Terminal state.</strong>
                </p>
              )}

              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Total Final Payout:</span>
                <strong style={{ fontSize: '1.3rem', color: qcOutcome === 'FAIL' ? '#ef4444' : '#006837' }}>
                  ₹{calculatedTotalPayout.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-gov-outline" onClick={() => setSelectedTicketForQc(null)}>
                Cancel
              </button>
              <button 
                className="btn-gov-saffron" 
                onClick={handleSaveQualityCheck}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={18} /> Record Result & Generate J-Form
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
