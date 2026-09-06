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
  AlertCircle,
  Truck
} from 'lucide-react';

const DEFAULT_STAGES = [
  {
    stage: 'gate_pass_issued',
    label: '1. Gate Pass Issued & Weighbridge Inward',
    hindiLabel: 'गेट पास जारी एवं धर्मकांटा आवक',
    description: 'Vehicle checked in at Mandi Gate with validated token pass.',
    completed: true,
    timestamp: '09:15 AM, 05 Sept 2026'
  },
  {
    stage: 'quality_verified',
    label: '2. Quality Tested & Grade Approved',
    hindiLabel: 'गुणवत्ता परीक्षण एवं ग्रेड स्वीकृत',
    description: 'Moisture (11.2%) & foreign matter lab analysis passed within base ceiling.',
    completed: true,
    timestamp: '09:42 AM, 05 Sept 2026'
  },
  {
    stage: 'paperwork_matched',
    label: '3. J-Form & Weight Slip Matched',
    hindiLabel: 'जे-फार्म एवं वजन पर्ची मिलान',
    description: 'Official digital J-Form #JFORM-2026-8812 generated and matched to scale slip.',
    completed: true,
    timestamp: '10:10 AM, 05 Sept 2026'
  },
  {
    stage: 'produce_lifted',
    label: '4. Produce Lifted from Mandi Storage',
    hindiLabel: 'उपज मंडी गोदाम से उठाई गई',
    description: 'Consignment loaded onto state agency/FCI storage transit trucks.',
    completed: true,
    timestamp: '11:30 AM, 05 Sept 2026'
  },
  {
    stage: 'payment_initiated',
    label: '5. Payment Batch Initiated via PFMS',
    hindiLabel: 'पीएफएमएस भुगतान प्रक्रिया आरंभ',
    description: 'DBT voucher batch file generated and transmitted to PFMS payment gateway.',
    completed: true,
    timestamp: '12:15 PM, 05 Sept 2026'
  },
  {
    stage: 'payment_credited',
    label: '6. Payment Credited via DBT (PFMS)',
    hindiLabel: 'डीबीटी द्वारा बैंक खाते में जमा',
    description: 'Funds successfully credited into verified SBI Bank A/C ending 4821.',
    completed: true,
    timestamp: '12:45 PM, 05 Sept 2026'
  }
];

export default function PaymentTracker({ ticket, farmerProfile }) {
  if (!ticket) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div className="gov-card" style={{ padding: '40px' }}>
          <AlertCircle size={48} color="var(--gov-saffron)" style={{ margin: '0 auto 16px' }} />
          <h2>No Procurement Payment Record Found</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Book and complete a procurement slot delivery to view the live PFMS payment pipeline.
          </p>
        </div>
      </div>
    );
  }

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

  const stages = payment.stageHistory || DEFAULT_STAGES;

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="gov-badge badge-green" style={{ background: '#dcfce7', color: '#14532d' }}>
              Direct Benefit Transfer (DBT)
            </span>
            <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 600 }}>
              Token #{ticket.tokenId}
            </span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
            Procurement & Payout Ledger (भुगतान खाता)
          </h2>
          <p style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 500, marginTop: '4px' }}>
            Beneficiary: <strong style={{ color: '#ffffff' }}>{farmerProfile.name}</strong> • Bank A/c: <strong style={{ color: '#fef08a' }}>{farmerProfile.bankAccount}</strong> ({farmerProfile.ifsc})
          </p>
        </div>

        <div style={{ background: '#ffffff', color: '#092543', padding: '16px 24px', borderRadius: '12px', border: '2px solid #092543', textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
            Total Net Payout
          </span>
          <h2 style={{ fontSize: '2.4rem', color: '#006837', fontWeight: 900 }}>
            ₹{ticket.estimatedPayout.toLocaleString('en-IN')}
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#092543', fontWeight: 700 }}>
            MSP Rate @ ₹{ticket.mspRate}/Quintal
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
        
        {/* 6-STAGE PAYMENT PIPELINE TIMELINE (Differentiator #2) */}
        <div className="gov-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={22} color="var(--gov-green)" /> 6-Stage PFMS Settlement Timeline
            </h3>
            <span className="gov-badge badge-green" style={{ fontSize: '0.75rem' }}>
              Zero Bottleneck Transparency
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Real-time stage tracking showing exactly where procurement funds are in the state payment pipeline:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
            {stages.map((stg, index) => {
              const isCompleted = stg.completed !== false;
              return (
                <div key={stg.stage || index} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div 
                    style={{ 
                      width: '34px', 
                      height: '34px', 
                      borderRadius: '50%', 
                      background: isCompleted ? '#006837' : '#e2e8f0', 
                      color: isCompleted ? '#ffffff' : '#64748b',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      flexShrink: 0,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      border: isCompleted ? 'none' : '2px solid #cbd5e1'
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={18} /> : index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {stg.label || stg.stage}
                      </h4>
                      {stg.timestamp && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--gov-green)', fontWeight: 700 }}>
                          {stg.timestamp}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                      {stg.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Digital Weighbridge Slip / J-Form Receipt */}
        <div className="gov-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={22} color="var(--gov-saffron)" /> Official Digital J-Form Receipt
            </h3>
            <span className="gov-badge badge-green">Official APMC E-Slip</span>
          </div>

          <div style={{ background: 'var(--gov-bg)', border: '2px solid var(--gov-border)', padding: '16px', borderRadius: '10px', fontSize: '0.92rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--gov-border)' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Mandi Center</span>
              <strong style={{ color: 'var(--text-primary)' }}>{ticket.mandiName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gov-border)' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Receipt #</span>
              <strong style={{ color: 'var(--gov-navy)' }}>{weighbridge.receiptNo}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gov-border)' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Crop & Quality Grade</span>
              <strong style={{ color: 'var(--text-primary)' }}>{ticket.cropName} ({weighbridge.qualityGrade})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gov-border)' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Moisture Content</span>
              <strong style={{ color: '#006837' }}>{weighbridge.moisturePercent || '11.2%'} (Within 12% Base)</strong>
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
            onClick={() => alert(`Downloading Official J-Form PDF (#${weighbridge.receiptNo}) for ${farmerProfile.name}...`)}
            style={{ width: '100%', justifyContent: 'center', marginTop: '16px', fontSize: '1rem' }}
          >
            <Download size={18} /> Download Official PDF Receipt
          </button>
        </div>

      </div>

    </div>
  );
}
