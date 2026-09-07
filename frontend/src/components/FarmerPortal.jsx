import React from 'react';
import { 
  PlusCircle, 
  Ticket, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Award,
  ArrowUpRight,
  TrendingUp,
  FileText,
  DollarSign,
  PhoneCall,
  UserCheck,
  Search,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function FarmerPortal({ 
  farmerProfile, 
  activeTickets, 
  onOpenBookingModal, 
  onViewQueueTracker,
  onViewPaymentDetails,
  mandiList,
  cropList,
  currentLang = 'en'
}) {
  const currentTicket = activeTickets[0];

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const farmerCornerServices = [
    { title: t.corner1Title, desc: t.corner1Desc, icon: PlusCircle, color: '#006837', action: onOpenBookingModal },
    { title: t.corner2Title, desc: t.corner2Desc, icon: Clock, color: '#c2410c', action: onViewQueueTracker },
    { title: t.corner3Title, desc: t.corner3Desc, icon: DollarSign, color: '#0b4a8b', action: onViewPaymentDetails },
    { title: t.corner4Title, desc: t.corner4Desc, icon: FileText, color: '#334155', action: onViewPaymentDetails }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Official High-Contrast Government Welcome Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span className="gov-badge badge-green" style={{ background: '#dcfce7', color: '#14532d', fontSize: '0.85rem' }}>
              <ShieldCheck size={14} /> Aadhaar Verified Beneficiary
            </span>
            <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>{t.farmerId}: {farmerProfile.farmerId}</span>
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff' }}>
            {t.welcome} {farmerProfile.name} 🙏
          </h2>
          <p style={{ color: '#f8fafc', fontSize: '1.05rem', marginTop: '6px', fontWeight: 500 }}>
            📍 {t.village}: <strong style={{ color: '#fef08a' }}>{farmerProfile.village}</strong> • {t.bankAcc}: <strong style={{ color: '#fef08a' }}>{farmerProfile.bankAccount}</strong> ({farmerProfile.ifsc})
          </p>
        </div>

        <button 
          className="btn-gov-saffron" 
          onClick={onOpenBookingModal}
          style={{ padding: '16px 28px', fontSize: '1.1rem', fontWeight: 800, border: '2px solid #ffffff' }}
        >
          <PlusCircle size={22} />
          {t.bookSlot}
        </button>
      </div>

      {/* DOMAIN RULE: VERIFIED LAND RECORD & JURISDICTIONAL MANDI ALLOCATION */}
      <div 
        className="gov-card" 
        style={{ 
          padding: '20px 24px', 
          marginBottom: '28px', 
          background: '#f8fafc',
          border: '2px solid #0284c7',
          borderRadius: '12px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="gov-badge badge-green" style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.8rem' }}>
              📜 Statutory Flow 1: Land Record & Season Registration
            </span>
            <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 800 }}>
              Khasra Record: {farmerProfile?.landRecord?.khasra || 'KH-78/14/2'} (Girdawari Verified)
            </span>
          </div>
          <span className="gov-badge badge-green" style={{ fontSize: '0.8rem' }}>
            ✓ Season Registration Approved
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.9rem' }}>
          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Certified Land Area</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#092543', margin: '2px 0 0' }}>{farmerProfile?.totalLandAcres || 8.5} Acres</p>
            <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>Zone: {farmerProfile?.village ? `ZONE-${farmerProfile.village.toUpperCase().replace(/\s+/g, '-')}` : 'ZONE-KARNAL-NORTH'}</span>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Eligible Crop & Season</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#006837', margin: '2px 0 0' }}>Wheat (गेहूँ) - Rabi 2026</p>
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Statutory MSP: ₹2,275/Qt</span>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Max Allowable Quota</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#c2410c', margin: '2px 0 0' }}>{Math.round((farmerProfile?.totalLandAcres || 8.5) * 20)} Quintals Max</p>
            <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 600 }}>Statutory Cap: 20 Qt/Acre</span>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Assigned APMC Mandi</span>
            <p style={{ fontSize: '1rem', fontWeight: 900, color: '#092543', margin: '2px 0 0' }}>Karnal Central Mandi</p>
            <span style={{ fontSize: '0.75rem', color: '#006837', fontWeight: 700 }}>🔒 Locked to Revenue Jurisdiction</span>
          </div>
        </div>
      </div>

      {/* FARMERS CORNER SERVICE GRID */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: '6px', height: '28px', background: 'var(--gov-saffron)' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gov-navy)' }}>
            {t.farmersCorner}
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {farmerCornerServices.map((service, idx) => {
            const IconComp = service.icon;
            return (
              <div 
                key={idx}
                className="gov-card"
                onClick={service.action}
                style={{
                  padding: '24px',
                  cursor: 'pointer',
                  borderTop: `6px solid ${service.color}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  background: 'var(--gov-card-bg)'
                }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: `${service.color}18`, color: service.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconComp size={28} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{service.title}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>{service.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Token & Mandi Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px', marginBottom: '32px' }}>
        
        {/* Active Ticket Official Card */}
        <div className="gov-card">
          <div className="gov-card-header green">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              <Ticket size={20} /> {t.activeToken}
            </span>
            {currentTicket && (
              <span className="gov-badge badge-saffron" style={{ background: '#ffffff', color: '#c2410c', fontWeight: 800 }}>
                {currentTicket.status.replace('_', ' ')}
              </span>
            )}
          </div>

          <div style={{ padding: '24px' }}>
            {currentTicket ? (
              <div>
                <div style={{ background: 'var(--gov-bg)', border: '2px solid var(--gov-border)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>{t.tokenNo}</span>
                      <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--gov-navy)' }}>
                        #{currentTicket.tokenId}
                      </h2>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>Mandi Center</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{currentTicket.mandiName}</h4>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '2px solid var(--gov-border)', fontSize: '0.95rem' }}>
                    <div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t.cropWeight}</span>
                      <p style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{currentTicket.cropName} ({currentTicket.quantityQuintals} Qt)</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t.estPayout}</span>
                      <p style={{ fontWeight: 800, color: 'var(--gov-green)', fontSize: '1.1rem' }}>₹{currentTicket.estimatedPayout.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-gov-primary" onClick={onViewQueueTracker} style={{ flex: 1, justifyContent: 'center' }}>
                    {t.trackQueue} <ChevronRight size={18} />
                  </button>
                  <button className="btn-gov-outline" onClick={onViewPaymentDetails}>
                    <DollarSign size={18} /> {t.dbtStatus}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                <AlertCircle size={44} style={{ margin: '0 auto 12px', color: 'var(--gov-saffron)' }} />
                <p style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>No active procurement slot booked today.</p>
                <button className="btn-gov-saffron" onClick={onOpenBookingModal}>
                  {t.bookSlot}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nearby Procurement Centers List */}
        <div className="gov-card">
          <div className="gov-card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              <Building2 size={20} /> {t.mandiCapacity}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 700 }}>{t.capacityTracker}</span>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mandiList.map((mandi) => {
              const capacityPercent = Math.round((mandi.currentBookedQuintals / mandi.dailyCapacityQuintals) * 100);
              return (
                <div 
                  key={mandi.id}
                  style={{
                    background: 'var(--gov-bg)',
                    border: '2px solid var(--gov-border)',
                    borderRadius: '10px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{mandi.name}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>📍 {mandi.distanceKm} km • {mandi.activeCounters} Counters Active</span>
                    </div>
                    <span className={`gov-badge ${capacityPercent > 80 ? 'badge-saffron' : 'badge-green'}`}>
                      {capacityPercent}% Full
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${capacityPercent}%`, height: '100%', background: capacityPercent > 80 ? '#ea580c' : '#006837' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* High-Contrast Government MSP Rate Chart Table */}
      <div className="gov-card">
        <div className="gov-card-header saffron">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
            <TrendingUp size={20} /> {t.mspTableTitle}
          </span>
          <span className="gov-badge badge-green" style={{ background: '#ffffff', color: '#006837', fontWeight: 800 }}>
            Official Gazette Rates
          </span>
        </div>

        <div style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.98rem' }}>
            <thead>
              <tr style={{ borderBottom: '3px solid var(--gov-border)', color: 'var(--text-primary)', background: 'var(--gov-bg)' }}>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>{t.cropName}</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>{t.season}</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>{t.mspRate}</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>{t.grossVal}</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {cropList.map((crop) => (
                <tr key={crop.id} style={{ borderBottom: '1px solid var(--gov-border)' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{crop.name}</td>
                  <td style={{ padding: '16px' }}>
                    <span className="gov-badge badge-saffron">{crop.category}</span>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 900, color: 'var(--gov-green)', fontSize: '1.1rem' }}>
                    ₹{crop.mspPerQuintal.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 800, color: 'var(--gov-navy)' }}>
                    ₹{(crop.mspPerQuintal * 50).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button className="btn-gov-outline" onClick={onOpenBookingModal} style={{ padding: '8px 14px', fontSize: '0.88rem' }}>
                      {t.bookSlot} <ArrowUpRight size={14} />
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
