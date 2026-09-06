import React from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download, 
  Building2, 
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export default function PaymentTracker({ ticket, farmerProfile }) {
  if (!ticket) return null;

  const weighbridge = ticket.weighbridgeDetails || {
    grossWeightKg: 4720,
    tareWeightKg: 220,
    netWeightKg: 4500,
    moisturePercent: '11.2%',
    qualityGrade: 'Grade A Superfine',
    receiptNo: 'JFORM-2026-8812'
  };

  const payment = ticket.paymentDetails || {
    dbtStatus: 'SUCCESS',
    txnRef: 'DBT-2026-991823',
    amount: ticket.estimatedPayout,
    settlementDate: '2026-09-05'
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Header Card */}
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
          <span className="gov-badge badge-green" style={{ background: '#dcfce7', color: '#14532d', marginBottom: '8px' }}>Direct Benefit Transfer (DBT)</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>Procurement & Payout Ledger (भुगतान खाता)</h2>
          <p style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 500 }}>
            Farmer: <strong style={{ color: '#ffffff' }}>{farmerProfile.name}</strong> • Bank A/c: <strong style={{ color: '#fef08a' }}>{farmerProfile.bankAccount}</strong>
          </p>
        </div>

        <div style={{ background: '#ffffff', color: '#092543', padding: '16px 24px', borderRadius: '12px', border: '2px solid #092543', textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Total Net Payout</span>
          <h2 style={{ fontSize: '2.4rem', color: '#006837', fontWeight: 900 }}>
            ₹{ticket.estimatedPayout.toLocaleString('en-IN')}
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#092543', fontWeight: 700 }}>MSP Rate @ ₹{ticket.mspRate}/Quintal</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
        
        {/* DBT Payment Status Timeline */}
        <div className="gov-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gov-navy)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={22} color="var(--gov-green)" /> DBT Settlement Timeline
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#006837', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>1. Weighbridge Slip Verified</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Net Weight: {weighbridge.netWeightKg / 100} Quintals ({weighbridge.qualityGrade})</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--gov-navy)', fontWeight: 700 }}>Receipt #: {weighbridge.receiptNo}</span>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#006837', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>2. Government MSP Payment Sanctioned</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Amount ₹{ticket.estimatedPayout.toLocaleString('en-IN')} approved by Procurement Officer</p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#006837', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>3. DBT Payout Credited via PFMS</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--gov-green)', fontWeight: 800 }}>
                  Directly credited to SBI Bank A/C ending 4821
                </p>
                <span style={{ fontSize: '0.8rem', color: 'var(--gov-navy)', fontWeight: 700 }}>Txn Ref: {payment.txnRef}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Digital Weighbridge Slip / J-Form Receipt */}
        <div className="gov-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={22} color="var(--gov-saffron)" /> Digital J-Form Receipt
            </h3>
            <span className="gov-badge badge-green">Official E-Slip</span>
          </div>

          <div style={{ background: 'var(--gov-bg)', border: '2px solid var(--gov-border)', padding: '16px', borderRadius: '10px', fontSize: '0.92rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--gov-border)' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Mandi Center</span>
              <strong style={{ color: 'var(--text-primary)' }}>{ticket.mandiName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gov-border)' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Crop & Grade</span>
              <strong style={{ color: 'var(--text-primary)' }}>{ticket.cropName} ({weighbridge.qualityGrade})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gov-border)' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Gross / Tare Weight</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{weighbridge.grossWeightKg} kg / {weighbridge.tareWeightKg} kg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gov-border)' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Net Procurement Weight</span>
              <strong style={{ color: 'var(--gov-green)', fontSize: '1.05rem' }}>{weighbridge.netWeightKg / 100} Quintals</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Total Net Value</span>
              <strong style={{ color: 'var(--gov-saffron)', fontSize: '1.2rem' }}>₹{ticket.estimatedPayout.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <button 
            className="btn-gov-primary" 
            onClick={() => alert('Downloading E-Receipt J-FORM PDF...')}
            style={{ width: '100%', justifyContent: 'center', marginTop: '16px', fontSize: '1rem' }}
          >
            <Download size={18} /> Download Official PDF Receipt
          </button>
        </div>

      </div>

    </div>
  );
}
