import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  AlertOctagon, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function AnalyticsView({ mandiList, currentLang = 'en' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Top Banner */}
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
          <span className="gov-badge badge-green" style={{ background: '#dcfce7', color: '#14532d', marginBottom: '8px' }}>
            📊 Ministry of Agriculture & Farmers Welfare
          </span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff' }}>
            {t.analyticsTitle}
          </h2>
          <p style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 500, marginTop: '4px' }}>
            {t.analyticsSub}
          </p>
        </div>

        <div style={{ background: '#ffffff', color: '#092543', padding: '16px 24px', borderRadius: '12px', border: '2px solid #092543', textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Season Procured Total</span>
          <h3 style={{ fontSize: '1.8rem', color: '#006837', fontWeight: 900 }}>
            1.24 Lakh Metric Tons
          </h3>
        </div>
      </div>

      {/* Analytics High-Contrast Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Card 1: Waiting Time Benchmark */}
        <div className="gov-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 800 }}>{t.metric1Title}</h4>
            <span className="gov-badge badge-green">⬇️ 74% Reduction</span>
          </div>
          <h2 style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--gov-green)' }}>
            {t.metric1Val} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ truck</span>
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>
            {t.metric1Sub}
          </p>
        </div>

        {/* Card 2: Congestion Prevention Index */}
        <div className="gov-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 800 }}>{t.metric2Title}</h4>
            <span className="gov-badge badge-saffron">94.2% On-Time</span>
          </div>
          <h2 style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--gov-saffron)' }}>
            {t.metric2Val}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>
            {t.metric2Sub}
          </p>
        </div>

        {/* Card 3: DBT Payout Speed */}
        <div className="gov-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 800 }}>{t.metric3Title}</h4>
            <span className="gov-badge badge-blue">Direct Benefit Transfer</span>
          </div>
          <h2 style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--gov-navy)' }}>
            {t.metric3Val}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>
            {t.metric3Sub}
          </p>
        </div>

      </div>

      {/* Regional Mandi Congestion Heatmap */}
      <div className="gov-card">
        <div className="gov-card-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
            <MapPin size={20} /> {t.heatmapTitle}
          </span>
        </div>

        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {mandiList.map((mandi) => {
            const capPercent = Math.round((mandi.currentBookedQuintals / mandi.dailyCapacityQuintals) * 100);
            return (
              <div 
                key={mandi.id}
                style={{
                  background: 'var(--gov-bg)',
                  border: '2px solid var(--gov-border)',
                  borderRadius: '12px',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{mandi.name}</h4>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>{mandi.district}, {mandi.state}</span>
                  </div>
                  <span className={`gov-badge ${capPercent > 80 ? 'badge-saffron' : 'badge-green'}`}>
                    {capPercent > 80 ? 'High Traffic' : 'Smooth Flow'}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 700 }}>
                    <span>Capacity Utilized</span>
                    <span>{capPercent}% ({mandi.currentBookedQuintals} Qt)</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${capPercent}%`, height: '100%', background: capPercent > 80 ? '#ea580c' : '#006837' }} />
                  </div>
                </div>

                {capPercent > 80 && (
                  <div style={{ marginTop: '16px', background: '#ffedd5', border: '1px solid #fdba74', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#9a3412', fontWeight: 700 }}>
                    <AlertOctagon size={18} />
                    <span>Dynamic Load Balancer re-routing new bookings to Kurukshetra Mandi.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
