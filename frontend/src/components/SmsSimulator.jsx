import React, { useState } from 'react';
import { 
  Smartphone, 
  Send, 
  MessageSquare, 
  Bell, 
  CheckCheck, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function SmsSimulator({ smsLogs, onSendSms }) {
  const [customMsg, setCustomMsg] = useState('');

  const handleSendCustom = (e) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    onSendSms({
      id: `sms-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'CUSTOM_ALERT',
      title: '📱 KisanQueue SMS Notification',
      message: customMsg
    });
    setCustomMsg('');
  };

  const presetMessages = [
    "KisanQueue Alert: Gate turn approaching! Token #KQ-408 proceed to Gate 1 Weighbridge.",
    "KisanQueue Alert: Harvest quality verified: Grade A Superfine. Payout processing.",
    "KisanQueue Alert: Payout of Rs. 1,02,375 credited directly to SBI A/C ending 4821 via DBT."
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-info pulse-badge">SIH 2026 Multi-Channel Alert Engine</span>
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '4px 0' }}>
          Feature Phone & SMS Gateway Simulator
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Ensures accessibility for rural farmers who do not use smartphones or internet apps.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
        
        {/* Smartphone UI Mockup */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div 
            style={{
              width: '320px',
              height: '580px',
              background: '#090d16',
              borderRadius: '40px',
              border: '10px solid #1e293b',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Phone Top Notch */}
            <div style={{ width: '120px', height: '18px', background: '#1e293b', margin: '0 auto', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }} />
            
            {/* Phone Header */}
            <div style={{ padding: '12px 16px', background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <MessageSquare size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: '#fff' }}>JK-KISANQ</h4>
                <span style={{ fontSize: '0.68rem', color: '#10b981' }}>Official SMS Gateway</span>
              </div>
            </div>

            {/* Messages Feed */}
            <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {smsLogs.map((log) => (
                <div 
                  key={log.id}
                  style={{
                    background: 'rgba(30, 41, 59, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    padding: '12px',
                    fontSize: '0.8rem',
                    color: '#f8fafc',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    animation: 'modal-slide-in 0.3s ease-out'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#94a3b8', fontSize: '0.7rem' }}>
                    <strong>{log.title}</strong>
                    <span>{log.time}</span>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.4 }}>{log.message}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <CheckCheck size={14} color="#10b981" />
                  </div>
                </div>
              ))}
            </div>

            {/* Phone Footer */}
            <div style={{ padding: '8px', background: '#0f172a', textAlign: 'center', fontSize: '0.7rem', color: '#64748b' }}>
              Simulated SMS Feed • Jio/Airtel Gateway
            </div>
          </div>
        </div>

        {/* Message Control Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="var(--accent)" /> Trigger Live Test Notification
          </h3>

          <form onSubmit={handleSendCustom} style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Type Custom SMS Payload:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="e.g. Proceed to Gate 1 Weighbridge..."
                className="input-field"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary">
                <Send size={16} /> Send
              </button>
            </div>
          </form>

          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Instant Trigger Presets:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {presetMessages.map((msg, i) => (
              <button 
                key={i}
                className="btn-secondary"
                onClick={() => onSendSms({
                  id: `sms-${Date.now()}`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  type: 'PRESET',
                  title: '🔔 Automated Alert',
                  message: msg
                })}
                style={{ textAlign: 'left', fontSize: '0.8rem', padding: '10px 14px', justifyContent: 'flex-start' }}
              >
                <Sparkles size={14} color="var(--accent)" /> {msg}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
