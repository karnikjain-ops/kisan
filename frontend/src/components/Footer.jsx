import React from 'react';
import { ShieldCheck, PhoneCall, Globe, Building2, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="gov-footer">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          
          {/* Column 1: KisanQueue Platform */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.98rem', fontWeight: 700, marginBottom: '10px' }}>
              KisanQueue (किसान-क्यू)
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              Direct Farmer Procurement & Mandi Logistics Management Platform<br />
              Designed for Smart India Hackathon 2026
            </p>
          </div>

          {/* Column 2: Toll-Free Helpline */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.98rem', fontWeight: 700, marginBottom: '10px' }}>
              Farmer Helpline & Toll-Free Support
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#fbbf24', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PhoneCall size={14} /> Toll-Free IVR: 155261 / 1800-115-526
            </p>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              Email Support: support@kisanqueue.org<br />
              Mon - Sat (8:00 AM to 6:00 PM)
            </p>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.98rem', fontWeight: 700, marginBottom: '10px' }}>
              Project Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              <a href="#" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Smart Anti-Congestion Engine</a>
              <a href="#" style={{ color: '#cbd5e1', textDecoration: 'none' }}>15-Minute Micro-Staggering Algorithm</a>
              <a href="#" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Feature Phone Toll-Free Call Booking (155261)</a>
              <a href="#" style={{ color: '#cbd5e1', textDecoration: 'none' }}>SIH 2026 Innovation Presentation</a>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: '#cbd5e1' }}>
          <div>
            Designed & Developed by <strong>Team KisanQueue</strong> for <strong>SIH 2026 Internal Hackathon</strong>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#86efac', fontWeight: 700 }}>Direct Farmer Procurement Platform</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
