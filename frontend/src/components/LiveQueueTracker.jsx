import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  Scale, 
  CreditCard, 
  AlertCircle, 
  Play, 
  QrCode,
  BellRing,
  ArrowRight,
  ShieldCheck,
  Users,
  TrendingDown,
  Sparkles,
  Award
} from 'lucide-react';
import { HOURLY_TRAFFIC_HISTORY, STAGE_QUEUE_BREAKDOWN } from '../data/mockData';

export default function LiveQueueTracker({ 
  ticket, 
  onAdvanceQueue, 
  onSimulateSms 
}) {
  if (!ticket) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div className="gov-card" style={{ padding: '40px' }}>
          <AlertCircle size={48} color="var(--gov-saffron)" style={{ margin: '0 auto 16px' }} />
          <h2>No Active Token Selected</h2>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 20px', fontSize: '1.05rem' }}>
            Book a procurement slot from the Farmer Portal to view real-time queue status.
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { title: '1. Gate Entry Check-in', desc: 'Scan QR at Mandi Gate 1', icon: Truck },
    { title: '2. Quality Check', desc: 'Moisture & Grade Analysis', icon: ShieldCheck },
    { title: '3. Weighbridge Slip', desc: 'Gross & Net Weight Scale', icon: Scale },
    { title: '4. DBT Payout Credit', desc: 'Direct Benefit Transfer', icon: CreditCard }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Banner: Ticket & Real-Time Position */}
      <div 
        className="gov-card" 
        style={{ 
          padding: '24px', 
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="gov-badge badge-green" style={{ background: '#dcfce7', color: '#14532d' }}>● LIVE MANDI QUEUE STATUS</span>
            <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>{ticket.mandiName}</span>
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '6px 0', color: '#ffffff' }}>
            Token Pass <span style={{ color: '#fef08a' }}>#{ticket.tokenId}</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 500 }}>
            🌾 Crop: <strong style={{ color: '#ffffff' }}>{ticket.cropName} ({ticket.quantityQuintals} Qt)</strong> • Time Slot: <strong style={{ color: '#ffffff' }}>{ticket.timeWindow}</strong>
          </p>
        </div>

        {/* Counter & Queue Status Pill */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ background: '#ffffff', color: '#092543', padding: '16px 24px', borderRadius: '12px', border: '2px solid #092543', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Currently Serving</span>
            <h3 style={{ fontSize: '1.8rem', color: '#c2410c', fontWeight: 900 }}>
              #KQ-404
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#092543', fontWeight: 800 }}>{ticket.counterNo}</span>
          </div>

          <div style={{ background: '#dcfce7', color: '#14532d', padding: '16px 24px', borderRadius: '12px', border: '2px solid #16a34a', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#166534', textTransform: 'uppercase', fontWeight: 800 }}>Your Queue Position</span>
            <h3 style={{ fontSize: '1.8rem', color: '#14532d', fontWeight: 900 }}>
              #{ticket.queuePosition} in Line
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#14532d', fontWeight: 700 }}>Est Wait: ~{ticket.estimatedWaitMins} mins</span>
          </div>
        </div>
      </div>

      {/* FEATURE 1: CURRENT PEOPLE STATUS IN QUEUE (LIVE BREAKDOWN) */}
      <div className="gov-card" style={{ marginBottom: '28px' }}>
        <div className="gov-card-header green">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
            <Users size={20} /> Current Mandi Yard Occupancy (वर्तमान मंडी कतार स्थिति)
          </span>
          <span className="gov-badge badge-green" style={{ background: '#ffffff', color: '#006837', fontWeight: 800 }}>
            28 Trucks Currently in Mandi
          </span>
        </div>

        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '18px', fontWeight: 600 }}>
            Real-time count of farmers & trucks currently processing across each stage at Karnal Central Mandi:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {STAGE_QUEUE_BREAKDOWN.map((stg) => (
              <div 
                key={stg.stageId}
                style={{
                  background: 'var(--gov-bg)',
                  border: '2px solid var(--gov-border)',
                  borderRadius: '12px',
                  padding: '18px',
                  borderTop: `6px solid ${stg.statusColor}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stage {stg.stageId}</span>
                  <span className="gov-badge badge-blue">~{stg.avgMins} mins</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>{stg.name}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '10px' }}>{stg.hindiName}</span>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: stg.statusColor }}>
                    {stg.currentInQueue}
                  </h2>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>Farmers in line</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURE 2: HOURLY TRAFFIC & WAITING TIME HISTORY (OPTIMAL ARRIVAL TIME ADVISOR) */}
      <div className="gov-card" style={{ marginBottom: '28px' }}>
        <div className="gov-card-header saffron">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
            <TrendingDown size={20} /> Mandi Time Slot Waiting History & Peak Advisor (समय सारणी सलाह)
          </span>
          <span className="gov-badge badge-green" style={{ background: '#ffffff', color: '#006837', fontWeight: 800 }}>
            Lowest Queue Advice
          </span>
        </div>

        <div style={{ padding: '24px' }}>
          
          {/* Smart Recommendation Banner for Farmers */}
          <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#78350f' }}>
            <Sparkles size={24} style={{ color: '#d97706', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '1.05rem', display: 'block' }}>💡 Smart Advice to Skip Queue / कम भीड़ वाला समय चुनें:</strong>
              <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>
                Arrive between <strong>08:00 AM - 10:00 AM</strong> or <strong>03:00 PM - 06:00 PM</strong> to get cleared in just <strong>10–12 minutes</strong> and avoid the 35-minute noon rush!
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.98rem' }}>
              <thead>
                <tr style={{ borderBottom: '3px solid var(--gov-border)', color: 'var(--text-primary)', background: 'var(--gov-bg)' }}>
                  <th style={{ padding: '14px 16px', fontWeight: 800 }}>Time Window (समय स्लॉट)</th>
                  <th style={{ padding: '14px 16px', fontWeight: 800 }}>Traffic Rush Level</th>
                  <th style={{ padding: '14px 16px', fontWeight: 800 }}>Avg Waiting Time</th>
                  <th style={{ padding: '14px 16px', fontWeight: 800 }}>Mandi Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {HOURLY_TRAFFIC_HISTORY.map((hist, i) => (
                  <tr 
                    key={i} 
                    style={{ 
                      borderBottom: '1px solid var(--gov-border)',
                      background: hist.isRecommended ? '#f0fdf4' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      <div>{hist.timeSlot}</div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{hist.label}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={`gov-badge ${hist.badgeColor}`}>
                        {hist.trafficLevel} ({hist.truckCount} Trucks)
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 900, color: hist.avgWaitMins < 15 ? 'var(--gov-green)' : 'var(--gov-saffron)', fontSize: '1.1rem' }}>
                      ~{hist.avgWaitMins} Minutes
                    </td>
                    <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {hist.isRecommended ? (
                        <span style={{ color: '#006837', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={18} /> {hist.tip}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>{hist.tip}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive 4-Step Pipeline Stepper */}
      <div className="gov-card" style={{ padding: '28px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gov-navy)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={22} color="var(--gov-navy)" /> Your Procurement Token Stage (आपका टोकन चरण)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {steps.map((step, idx) => {
            const isDone = idx < ticket.currentStepIndex;
            const isCurrent = idx === ticket.currentStepIndex;
            const IconComp = step.icon;

            return (
              <div 
                key={idx}
                style={{
                  background: isCurrent 
                    ? '#fef3c7' 
                    : isDone 
                    ? '#f0fdf4' 
                    : 'var(--gov-bg)',
                  border: isCurrent 
                    ? '3px solid #d97706' 
                    : isDone 
                    ? '2px solid #16a34a' 
                    : '2px solid var(--gov-border)',
                  borderRadius: '12px',
                  padding: '20px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: isCurrent ? '#c2410c' : isDone ? '#006837' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <IconComp size={24} />
                  </div>
                  {isDone ? (
                    <span className="gov-badge badge-green"><CheckCircle2 size={14} /> Done</span>
                  ) : isCurrent ? (
                    <span className="gov-badge badge-saffron">In Progress</span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Pending</span>
                  )}
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{step.title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Simulation Controls for SIH Judges */}
      <div className="gov-card" style={{ padding: '24px' }}>
        <div className="gov-card-header saffron" style={{ margin: '-24px -24px 20px -24px', borderRadius: 0 }}>
          <span style={{ color: '#ffffff', fontWeight: 800 }}>SIH 2026 Live Demo Controls</span>
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Simulate Real-Time Mandi Queue</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '18px', fontWeight: 500 }}>
          Click below to advance counter progress or trigger real-time SMS alerts to see live queue updates.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-gov-primary" onClick={onAdvanceQueue} style={{ flex: 1, justifyContent: 'center' }}>
            <Play size={18} /> Advance Queue (+1 Step)
          </button>
          <button className="btn-gov-outline" onClick={onSimulateSms} style={{ flex: 1, justifyContent: 'center' }}>
            <BellRing size={18} /> Trigger SMS Alert
          </button>
        </div>
      </div>

    </div>
  );
}
