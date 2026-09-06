import React, { useState } from 'react';
import { 
  X, 
  Check, 
  MapPin, 
  Calendar, 
  Clock, 
  QrCode, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Lock,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SlotBookingModal({ 
  isOpen, 
  onClose, 
  mandiList, 
  cropList, 
  farmerProfile, 
  onSlotBooked 
}) {
  const [step, setStep] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState(cropList[0].id);
  const [quantity, setQuantity] = useState(40);
  const [selectedMandi, setSelectedMandi] = useState(mandiList[0].id);
  const [slotDate, setSlotDate] = useState('2026-09-05');
  const [timeWindow, setTimeWindow] = useState('10:00 AM - 01:00 PM');
  const [createdTicket, setCreatedTicket] = useState(null);

  if (!isOpen) return null;

  const currentCropObj = cropList.find(c => c.id === selectedCrop) || cropList[0];
  const currentMandiObj = mandiList.find(m => m.id === selectedMandi) || mandiList[0];
  const calculatedPayout = quantity * currentCropObj.mspPerQuintal;

  const timeSlotCaps = [
    { window: '08:00 AM - 10:00 AM', booked: 14, max: 15, isFull: false, subSlot: '10:15 AM Entry' },
    { window: '10:00 AM - 01:00 PM', booked: 15, max: 15, isFull: true, subSlot: 'FULL - Re-routed' },
    { window: '01:00 PM - 03:00 PM', booked: 6, max: 15, isFull: false, subSlot: '01:45 PM Entry' },
    { window: '03:00 PM - 06:00 PM', booked: 3, max: 15, isFull: false, subSlot: '03:30 PM Entry' }
  ];

  const handleBookSlot = () => {
    const randomTokenNum = Math.floor(400 + Math.random() * 200);
    const newTicket = {
      tokenId: `KQ-${randomTokenNum}`,
      farmerName: farmerProfile.name,
      farmerId: farmerProfile.farmerId,
      phone: farmerProfile.phone,
      mandiName: currentMandiObj.name,
      mandiId: currentMandiObj.id,
      cropName: currentCropObj.name,
      cropCategory: currentCropObj.id,
      quantityQuintals: parseInt(quantity),
      mspRate: currentCropObj.mspPerQuintal,
      estimatedPayout: calculatedPayout,
      slotDate: slotDate,
      timeWindow: timeWindow,
      counterNo: 'Counter #' + Math.floor(1 + Math.random() * 4),
      status: 'BOOKED',
      currentStepIndex: 0,
      queuePosition: Math.floor(3 + Math.random() * 6),
      estimatedWaitMins: Math.floor(15 + Math.random() * 25),
      transitDistanceKm: currentMandiObj.distanceKm,
      recommendedDepartureTime: '09:15 AM',
      staggeredGateTime: '10:15 AM (15-min Micro Window)',
      qrCodeData: `KQ-${randomTokenNum}-${farmerProfile.farmerId}`,
      createdTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCreatedTicket(newTicket);
    setStep(4);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    onSlotBooked(newTicket);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '28px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid var(--gov-border)' }}>
          <div>
            <span className="gov-badge badge-green" style={{ fontSize: '0.8rem' }}>SIH 2026 Smart Anti-Congestion Engine</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--gov-navy)' }}>
              {step === 4 ? '🎉 Slot Booking Confirmed!' : 'Book Mandi Procurement Slot'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={28} />
          </button>
        </div>

        {/* Stepper indicator */}
        {step < 4 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  borderRadius: '8px', 
                  textAlign: 'center',
                  background: step === s ? 'var(--gov-navy)' : step > s ? 'var(--gov-green)' : 'var(--gov-bg)',
                  color: step === s || step > s ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  border: '1px solid var(--gov-border)'
                }}
              >
                {s === 1 ? '1. Crop & Qty' : s === 2 ? '2. Mandi Capacity' : '3. Staggered Slot'}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Crop & Quantity */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '8px' }}>
                Select Crop / फसल चुनें
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {cropList.map((crop) => (
                  <div
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop.id)}
                    style={{
                      background: selectedCrop === crop.id ? '#e6f4ea' : 'var(--gov-bg)',
                      border: selectedCrop === crop.id ? '3px solid #006837' : '2px solid var(--gov-border)',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{crop.name}</h4>
                    <p style={{ fontSize: '0.88rem', color: '#006837', fontWeight: 800, marginTop: '4px' }}>
                      MSP: ₹{crop.mspPerQuintal}/Qt
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '8px' }}>
                Quantity to Sell (Quintals / कुंतल में मात्रा)
              </label>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, e.target.value))}
                className="gov-input"
                style={{ fontSize: '1.4rem', fontWeight: 900 }}
              />
              <span style={{ fontSize: '0.95rem', color: '#334155', marginTop: '6px', display: 'block', fontWeight: 700 }}>
                Estimated Total Value: <strong style={{ color: '#006837', fontSize: '1.2rem' }}>₹{calculatedPayout.toLocaleString('en-IN')}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn-gov-primary" onClick={() => setStep(2)}>
                Next: Select Mandi <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Mandi Selection */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <label style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--gov-navy)' }}>
              Choose Procurement Center (मंडी केंद्र चुनें)
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mandiList.map((mandi) => {
                const isSelected = selectedMandi === mandi.id;
                const capacityPercent = Math.round(((mandi.currentBookedQuintals + parseInt(quantity)) / mandi.dailyCapacityQuintals) * 100);
                const isFull = capacityPercent > 95;

                return (
                  <div
                    key={mandi.id}
                    onClick={() => !isFull && setSelectedMandi(mandi.id)}
                    style={{
                      background: isSelected ? '#e6f4ea' : 'var(--gov-bg)',
                      border: isSelected ? '3px solid #006837' : '2px solid var(--gov-border)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: isFull ? 'not-allowed' : 'pointer',
                      opacity: isFull ? 0.6 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{mandi.name}</h4>
                        <span style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>
                          📍 {mandi.distanceKm} km away • {mandi.avgProcessingTimeMins} mins avg turnaround
                        </span>
                      </div>
                      <span className={`gov-badge ${capacityPercent > 80 ? 'badge-saffron' : 'badge-green'}`}>
                        {capacityPercent}% Daily Capacity
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button className="btn-gov-outline" onClick={() => setStep(1)}>
                <ChevronLeft size={20} /> Back
              </button>
              <button className="btn-gov-primary" onClick={() => setStep(3)}>
                Next: Select Staggered Time Slot <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Date & Staggered Time Window */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '8px' }}>
                Select Preferred Date (तारीख चुनें)
              </label>
              <input 
                type="date" 
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="gov-input"
              />
            </div>

            <div style={{ background: '#e0f2fe', border: '2px solid #0284c7', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', color: '#0369a1', fontWeight: 700 }}>
              🛡️ <strong>Smart Anti-Congestion Engine Active:</strong> Each time slot has a hard threshold (15 trucks/window) & 15-minute micro departure times to prevent gate traffic jams.
            </div>

            <div>
              <label style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block', marginBottom: '8px' }}>
                Select Micro-Staggered Window (माइक्रो-समय स्लॉट चुनें)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {timeSlotCaps.map((slot) => {
                  const isSelected = timeWindow === slot.window;
                  return (
                    <div
                      key={slot.window}
                      onClick={() => !slot.isFull && setTimeWindow(slot.window)}
                      style={{
                        background: slot.isFull ? '#fee2e2' : isSelected ? '#e6f4ea' : 'var(--gov-bg)',
                        border: slot.isFull ? '2px solid #ef4444' : isSelected ? '3px solid #006837' : '2px solid var(--gov-border)',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: slot.isFull ? 'not-allowed' : 'pointer',
                        opacity: slot.isFull ? 0.7 : 1
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <Clock size={20} color={slot.isFull ? '#ef4444' : '#c2410c'} />
                        {slot.isFull ? (
                          <span className="gov-badge badge-saffron" style={{ background: '#ef4444', color: '#ffffff !important' }}>
                            <Lock size={12} /> FULL (15/15)
                          </span>
                        ) : (
                          <span className="gov-badge badge-green">
                            {slot.booked}/{slot.max} Booked
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: slot.isFull ? '#991b1b' : '#0f172a' }}>
                        {slot.window}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: slot.isFull ? '#991b1b' : '#006837', fontWeight: 700, marginTop: '4px', display: 'block' }}>
                        {slot.isFull ? 'Overcrowding Locked' : `Assigned Gate Time: ${slot.subSlot}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button className="btn-gov-outline" onClick={() => setStep(2)}>
                <ChevronLeft size={20} /> Back
              </button>
              <button className="btn-gov-saffron" onClick={handleBookSlot}>
                Confirm & Generate Staggered Token <Sparkles size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Ticket */}
        {step === 4 && createdTicket && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ 
              background: '#f0fdf4', 
              border: '3px dashed #006837', 
              borderRadius: '16px', 
              padding: '24px',
              marginBottom: '20px'
            }}>
              <span className="gov-badge badge-green" style={{ marginBottom: '10px' }}>
                <ShieldCheck size={16} /> Official Staggered Gate Token Pass
              </span>
              <h1 style={{ fontSize: '3rem', color: '#006837', fontWeight: 900 }}>
                #{createdTicket.tokenId}
              </h1>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '2px solid #092543', display: 'inline-block' }}>
                  <QrCode size={130} color="#092543" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textTransform: 'none', textAlign: 'left', background: '#ffffff', border: '1px solid var(--gov-border)', padding: '16px', borderRadius: '10px', fontSize: '0.92rem', color: '#0f172a' }}>
                <div>
                  <span style={{ color: '#475569', fontWeight: 700 }}>Center:</span>
                  <p style={{ fontWeight: 800, color: '#0f172a' }}>{createdTicket.mandiName}</p>
                </div>
                <div>
                  <span style={{ color: '#475569', fontWeight: 700 }}>Staggered Gate Time:</span>
                  <p style={{ fontWeight: 800, color: '#006837' }}>{createdTicket.staggeredGateTime}</p>
                </div>
                <div>
                  <span style={{ color: '#475569', fontWeight: 700 }}>Crop Qty:</span>
                  <p style={{ fontWeight: 800, color: '#0f172a' }}>{createdTicket.cropName} ({createdTicket.quantityQuintals} Qt)</p>
                </div>
                <div>
                  <span style={{ color: '#475569', fontWeight: 700 }}>Queue Token:</span>
                  <p style={{ fontWeight: 900, color: '#c2410c' }}>Position #{createdTicket.queuePosition}</p>
                </div>
              </div>
            </div>

            <button className="btn-gov-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem' }}>
              Done & View Live Queue Status
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
