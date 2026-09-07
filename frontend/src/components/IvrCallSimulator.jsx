import React, { useState } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  Volume2, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles,
  Tractor,
  ShieldCheck,
  Calendar,
  Clock,
  Radio,
  Tv,
  Megaphone,
  FileCheck
} from 'lucide-react';
import { bookSlotApi } from '../services/api';
import confetti from 'canvas-confetti';

export default function IvrCallSimulator({ onSlotBooked, farmerProfile }) {
  const [callState, setCallState] = useState('IDLE'); // IDLE, DIALING, CONNECTED, SUCCESS, ENDED
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedMandi, setSelectedMandi] = useState('Karnal Central Mandi');
  const [selectedSlot, setSelectedSlot] = useState('08:00 AM - 10:00 AM');
  const [generatedToken, setGeneratedToken] = useState(null);

  const startCall = () => {
    setCallState('DIALING');
    setTimeout(() => {
      setCallState('CONNECTED');
      setCurrentStep(1);
    }, 1500);
  };

  const handleKeypress = async (key) => {
    if (currentStep === 1) {
      if (key === '1') setSelectedCrop('Wheat (गेहूँ)');
      else if (key === '2') setSelectedCrop('Mustard (सरसों)');
      else if (key === '3') setSelectedCrop('Paddy (धान)');
      else setSelectedCrop('Wheat (गेहूँ)');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      let chosenSlot = '08:00 AM - 10:00 AM';
      if (key === '1') chosenSlot = '08:00 AM - 10:00 AM';
      else if (key === '2') chosenSlot = '01:00 PM - 03:00 PM';
      else chosenSlot = '03:00 PM - 06:00 PM';
      setSelectedSlot(chosenSlot);
      
      const cropVal = selectedCrop || 'Wheat (गेहूँ)';
      const randomToken = `KQ-${Math.floor(400 + Math.random() * 200)}`;

      let newTicket = {
        tokenId: randomToken,
        farmerName: farmerProfile.name,
        farmerId: farmerProfile.farmerId,
        phone: farmerProfile.phone,
        mandiName: selectedMandi,
        mandiId: 'mandi-1',
        cropName: cropVal,
        quantityQuintals: 45,
        mspRate: 2275,
        estimatedPayout: 102375,
        slotDate: '2026-09-05',
        timeWindow: chosenSlot,
        counterNo: 'Counter #2',
        status: 'BOOKED_VIA_IVR',
        currentStepIndex: 0,
        queuePosition: 3,
        estimatedWaitMins: 12,
        transitDistanceKm: 12,
        recommendedDepartureTime: '07:30 AM',
        staggeredGateTime: '08:15 AM (15-min Micro Window)',
        bookingChannel: 'IVR Toll-Free Phone Call (155261)'
      };

      try {
        const apiRes = await bookSlotApi({
          farmer_id: farmerProfile.farmerId || 'FARM-2026-9842',
          crop_name: cropVal.includes('Wheat') ? 'Wheat' : cropVal.includes('Mustard') ? 'Mustard' : 'Paddy',
          centre_id: 'mandi-1',
          slot_date: '2026-09-05',
          time_window: chosenSlot,
          quantity_quintals: 45,
          transit_distance_km: 12,
          booking_channel: 'IVR Toll-Free Phone Call (155261)'
        });

        if (apiRes && apiRes.success && apiRes.ticket) {
          newTicket = {
            ...newTicket,
            ...apiRes.ticket,
            bookingChannel: 'IVR Toll-Free Phone Call (155261)'
          };
        }
      } catch (err) {
        console.warn('Backend IVR slot booking failed, using fallback:', err);
      }

      setGeneratedToken(newTicket);
      onSlotBooked(newTicket);
      setCallState('SUCCESS');

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const endCall = () => {
    setCallState('ENDED');
    setTimeout(() => {
      setCallState('IDLE');
      setCurrentStep(1);
    }, 1000);
  };

  const awarenessChannels = [
    { title: '1. Broadcast SMS Alerts to PM-KISAN Farmers', desc: 'Govt sends SMS to all 11+ Crore registered farmer mobile numbers before harvest season containing 155261.', icon: MessageSquare, badge: 'Direct Mobile Alert' },
    { title: '2. Wall Paintings at Gram Panchayat & Mandi Gates', desc: 'Prominent posters & wall art painted at Gram Chaupal, Krishi Bhawan, and Mandi entrance gates.', icon: Megaphone, badge: 'Village Wall Art' },
    { title: '3. Radio & DD Kisan National TV Broadcasts', desc: 'Season jingles broadcast on DD Kisan, All India Radio (AIR), and Krishi Vigyan Kendra (KVK) programs.', icon: Tv, badge: 'Mass Media' },
    { title: '4. Printed on Fertilizer & Subsidy Slips (J-Form)', desc: 'Toll-free number 155261 is pre-printed on all official subsidy slips, soil cards, and Mandi receipts.', icon: FileCheck, badge: 'Govt Receipts' }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Banner */}
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
          <span className="gov-badge badge-saffron" style={{ background: '#ea580c', color: '#ffffff', marginBottom: '8px' }}>
            📞 Toll-Free Rural Outreach Engine
          </span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff' }}>
            How Farmers Discover Toll-Free Number 155261 (Without Internet)
          </h2>
          <p style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 500, marginTop: '4px' }}>
            Multi-channel offline awareness strategy reaching rural farmers directly in their villages.
          </p>
        </div>

        <div style={{ background: '#ffffff', color: '#092543', padding: '14px 20px', borderRadius: '12px', textAlign: 'right', border: '2px solid #092543' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Toll-Free Number</span>
          <h3 style={{ fontSize: '1.8rem', color: '#c2410c', fontWeight: 900 }}>155261</h3>
          <span style={{ fontSize: '0.8rem', color: '#006837', fontWeight: 800 }}>24x7 Multi-lingual IVR</span>
        </div>
      </div>

      {/* 4 Offline Awareness Channels Grid */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: '6px', height: '28px', background: 'var(--gov-saffron)' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gov-navy)' }}>
            📢 4 Offline Awareness & Number Dissemination Channels (बिना इंटरनेट जानकारी)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {awarenessChannels.map((ch, idx) => {
            const IconComp = ch.icon;
            return (
              <div key={idx} className="gov-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={24} />
                  </div>
                  <span className="gov-badge badge-saffron">{ch.badge}</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gov-navy)', marginBottom: '6px' }}>{ch.title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>{ch.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
        
        {/* Interactive Phone Call Interface */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div 
            style={{
              width: '330px',
              height: '620px',
              background: '#091322',
              borderRadius: '40px',
              border: '10px solid #1e293b',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              color: '#ffffff'
            }}
          >
            {/* Top Speaker */}
            <div style={{ width: '90px', height: '14px', background: '#1e293b', margin: '0 auto', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }} />
            
            <div style={{ padding: '24px 16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {callState === 'IDLE' ? 'TOLL-FREE IVR LINE' : callState === 'DIALING' ? 'DIALING...' : callState === 'CONNECTED' ? 'CALL IN PROGRESS' : 'CALL COMPLETED'}
                </span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fef08a', marginTop: '4px' }}>
                  155261
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#38bdf8' }}>PM-KISAN Voice Assistance</span>
              </div>

              {/* Dynamic Call Voice Prompts */}
              <div style={{ background: '#152238', border: '1px solid #263859', borderRadius: '16px', padding: '16px', minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {callState === 'IDLE' && (
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    Press <strong>Start Phone Call</strong> to test dialing the toll-free number from a feature phone.
                  </p>
                )}

                {callState === 'DIALING' && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', animation: 'pulse-ring 1s infinite' }}>📞</div>
                    <p style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700, marginTop: '8px' }}>Connecting to Mandi IVR Server...</p>
                  </div>
                )}

                {callState === 'CONNECTED' && currentStep === 1 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>🔊 IVR Voice Prompt (Hindi):</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: '6px 0', color: '#fff' }}>
                      "गेहूँ बेचने के लिए 1 दबाएं, सरसों के लिए 2 दबाएं, धान के लिए 3 दबाएं।"
                    </p>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Press Keypad Button below 👇</span>
                  </div>
                )}

                {callState === 'CONNECTED' && currentStep === 2 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>🔊 IVR Voice Prompt (Hindi):</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: '6px 0', color: '#fff' }}>
                      "सुबह 8 से 10 बजे का स्लॉट चुनने के लिए 1 दबाएं। शाम के स्लॉट के लिए 2 दबाएं।"
                    </p>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Press Keypad Button below 👇</span>
                  </div>
                )}

                {callState === 'SUCCESS' && generatedToken && (
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 800 }}>✅ Slot Booked via Call!</span>
                    <h3 style={{ fontSize: '1.4rem', color: '#fde047', fontWeight: 900, margin: '4px 0' }}>
                      Token #{generatedToken.tokenId}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                      SMS sent to your feature phone with Token & Gate pass details!
                    </p>
                  </div>
                )}
              </div>

              {/* Keypad Buttons */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                    <button 
                      key={k}
                      disabled={callState !== 'CONNECTED'}
                      onClick={() => handleKeypress(k)}
                      style={{
                        background: callState === 'CONNECTED' ? '#1e293b' : '#0f172a',
                        color: '#ffffff',
                        border: '1px solid #334155',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        margin: '0 auto',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        cursor: callState === 'CONNECTED' ? 'pointer' : 'not-allowed',
                        opacity: callState === 'CONNECTED' ? 1 : 0.4
                      }}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                {callState === 'IDLE' ? (
                  <button className="btn-gov-primary" onClick={startCall} style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}>
                    <PhoneCall size={18} /> Start Toll-Free Call (155261)
                  </button>
                ) : (
                  <button className="btn-gov-saffron" onClick={endCall} style={{ width: '100%', justifyContent: 'center', background: '#ef4444', fontSize: '1rem' }}>
                    <PhoneOff size={18} /> End Call / फिर से कॉल करें
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="gov-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="var(--gov-green)" /> 3 Non-SmartPhone Booking Options
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--gov-bg)', border: '2px solid var(--gov-border)', padding: '16px', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gov-navy)' }}>
                1. Toll-Free IVR Voice Booking (155261)
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                Farmers dial <strong>155261</strong> from any basic keypad phone. Local language automated prompts guide them to select crop & time window using telephone keys.
              </p>
            </div>

            <div style={{ background: 'var(--gov-bg)', border: '2px solid var(--gov-border)', padding: '16px', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gov-navy)' }}>
                2. Gram Panchayat & CSC Kiosk Assisted Booking
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                Village Gram Sewak or Common Service Center (CSC) VLE operators book slots for illiterate farmers using their Aadhaar/Farmer ID.
              </p>
            </div>

            <div style={{ background: 'var(--gov-bg)', border: '2px solid var(--gov-border)', padding: '16px', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gov-navy)' }}>
                3. Instant Automated SMS Pass Delivery
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                Once booked via call or kiosk, an official SMS pass containing token number, departure time, and weighbridge gate number is delivered directly to the farmer's feature phone.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
