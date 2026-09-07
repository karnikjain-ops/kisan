import React, { useState, useEffect } from 'react';
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
  Layers,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { bookSlotApi, fetchSlotAvailabilityApi } from '../services/api';

function calculateDepartureTime(gateTime, distanceKm = 12) {
  const match = (gateTime || '').match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return '07:30 AM';
  let hour = parseInt(match[1]);
  let minute = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  const transitMins = Math.round(distanceKm * 2.5 + 15);
  let totalMinutes = hour * 60 + minute - transitMins;
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  let depHour24 = Math.floor(totalMinutes / 60) % 24;
  let depMin = totalMinutes % 60;
  const depAmpm = depHour24 >= 12 ? 'PM' : 'AM';
  let depHour12 = depHour24 > 12 ? depHour24 - 12 : depHour24 === 0 ? 12 : depHour24;
  return `${depHour12}:${depMin < 10 ? '0' : ''}${depMin} ${depAmpm}`;
}

export default function SlotBookingModal({ 
  isOpen, 
  onClose, 
  mandiList, 
  cropList, 
  farmerProfile, 
  onSlotBooked 
}) {
  const [step, setStep] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState(cropList[0]?.id || 'wheat');
  const [quantity, setQuantity] = useState(45);
  const [selectedMandi, setSelectedMandi] = useState(mandiList[0]?.id || 'mandi-1');
  const [slotDate, setSlotDate] = useState('2026-09-05');
  const [timeWindow, setTimeWindow] = useState('08:00 AM - 10:00 AM');
  const [createdTicket, setCreatedTicket] = useState(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const [timeSlotCaps, setTimeSlotCaps] = useState([
    { window: '08:00 AM - 10:00 AM', booked: 14, max: 15, isFull: false, subSlot: '10:15 AM Entry' },
    { window: '10:00 AM - 01:00 PM', booked: 15, max: 15, isFull: true, subSlot: 'FULL - Re-routed' },
    { window: '01:00 PM - 03:00 PM', booked: 6, max: 15, isFull: false, subSlot: '01:45 PM Entry' },
    { window: '03:00 PM - 06:00 PM', booked: 3, max: 15, isFull: false, subSlot: '03:30 PM Entry' }
  ]);

  // Fetch real-time slot availability from backend when mandi, date, or open state changes
  useEffect(() => {
    async function loadSlotAvailability() {
      if (!selectedMandi || !slotDate) return;
      try {
        const slots = await fetchSlotAvailabilityApi(selectedMandi, slotDate);
        if (slots && slots.length > 0) {
          setTimeSlotCaps(slots);
          // If current timeWindow is full or not present, select first available non-full slot
          const cur = slots.find(s => s.window === timeWindow);
          if (!cur || cur.isFull) {
            const firstAvailable = slots.find(s => !s.isFull);
            if (firstAvailable) {
              setTimeWindow(firstAvailable.window);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load slot availability:', e);
      }
    }
    if (isOpen) {
      loadSlotAvailability();
    }
  }, [selectedMandi, slotDate, isOpen]);

  if (!isOpen) return null;

  const currentCropObj = cropList.find(c => c.id === selectedCrop) || cropList[0];
  const currentMandiObj = mandiList.find(m => m.id === selectedMandi) || mandiList[0];
  const numQuantity = parseFloat(quantity) || 0;
  const calculatedPayout = numQuantity * (currentCropObj?.mspPerQuintal || 2275);
  const farmerAcres = farmerProfile?.totalLandAcres || 8.5;
  const maxAllowableQuota = Math.round(farmerAcres * 20);

  const handleBookSlot = async () => {
    setIsBookingLoading(true);
    setBookingError(null);
    let newTicket = null;
    try {
      const res = await bookSlotApi({
        farmer_id: farmerProfile.farmerId,
        crop_id: selectedCrop,
        quantity: numQuantity || 45,
        mandi_id: selectedMandi,
        slot_date: slotDate,
        time_window: timeWindow,
        booking_channel: 'Web Portal'
      });

      if (res && res.success && res.ticket) {
        newTicket = res.ticket;
      } else if (res && !res.success) {
        setBookingError(res.message || 'Slot capacity full. Please choose another time window.');
        setIsBookingLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Backend booking error, using client fallback:', e);
    }

    if (!newTicket) {
      const randomTokenNum = Math.floor(400 + Math.random() * 200);
      const queuePos = Math.floor(2 + Math.random() * 4);
      const gateTimeStr = `${timeWindow.split(' - ')[0]} Entry (15-min Micro Window)`;
      const depTimeStr = calculateDepartureTime(timeWindow.split(' - ')[0], currentMandiObj.distanceKm || 12);
      const estWait = Math.max(5, Math.round(((queuePos - 1) * (currentMandiObj.avgProcessingTimeMins || 14)) / (currentMandiObj.activeCounters || 6)));

      newTicket = {
        tokenId: `KQ-${randomTokenNum}`,
        farmerName: farmerProfile.name,
        farmerId: farmerProfile.farmerId,
        phone: farmerProfile.phone,
        mandiName: currentMandiObj.name,
        mandiId: currentMandiObj.id,
        cropName: currentCropObj.name,
        cropCategory: currentCropObj.id,
        quantityQuintals: numQuantity || 45,
        mspRate: currentCropObj.mspPerQuintal,
        estimatedPayout: calculatedPayout,
        slotDate: slotDate,
        timeWindow: timeWindow,
        counterNo: 'Counter #' + Math.floor(1 + Math.random() * 4),
        status: 'BOOKED',
        currentStepIndex: 0,
        queuePosition: queuePos,
        estimatedWaitMins: estWait,
        transitDistanceKm: currentMandiObj.distanceKm,
        recommendedDepartureTime: depTimeStr,
        staggeredGateTime: gateTimeStr,
        qrCodeData: `KQ-${randomTokenNum}-${farmerProfile.farmerId}`,
        createdTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    // Immediately update local slot capacity state so 14/15 updates to 15/15 FULL
    setTimeSlotCaps(prev => prev.map(s => {
      if (s.window === timeWindow) {
        const newBooked = Math.min(s.max, s.booked + 1);
        return {
          ...s,
          booked: newBooked,
          isFull: newBooked >= s.max,
          subSlot: newBooked >= s.max ? 'FULL - Re-routed' : s.subSlot
        };
      }
      return s;
    }));

    setIsBookingLoading(false);
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
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setQuantity('');
                  } else {
                    const parsed = parseInt(val, 10);
                    setQuantity(isNaN(parsed) ? '' : Math.max(1, parsed));
                  }
                }}
                min="1"
                placeholder="Enter quantity"
                className="gov-input"
                style={{ fontSize: '1.4rem', fontWeight: 900 }}
              />
              {numQuantity > maxAllowableQuota && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 800, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} /> Warning: {maxAllowableQuota} Quintals is the statutory yield quota for {farmerAcres} acres (20 Qt/Acre). Excess quantity will be rejected at gate check.
                </div>
              )}
              <span style={{ fontSize: '0.95rem', color: '#334155', marginTop: '6px', display: 'block', fontWeight: 700 }}>
                Estimated Total Value: <strong style={{ color: '#006837', fontSize: '1.2rem' }}>₹{calculatedPayout.toLocaleString('en-IN')}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button 
                className="btn-gov-primary" 
                onClick={() => {
                  if (!quantity || numQuantity < 1) {
                    setQuantity(45);
                  }
                  setStep(2);
                }}
              >
                Next: Select Mandi / Queue <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Jurisdictional Mandi & Queue Selection */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--gov-navy)', display: 'block' }}>
                Select Procurement Mandi & Queue (खरीद केंद्र व कतार चुनें)
              </label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Your default assigned centre is based on your revenue zone (<strong>ZONE-KARNAL-NORTH</strong>). You can select any nearby mandi queue according to your logistical preference.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mandiList.map((mandi) => {
                const isDefaultAssigned = mandi.id === 'mandi-1';
                const isSelected = selectedMandi === mandi.id;
                const capacityPercent = Math.min(100, Math.round(((mandi.currentBookedQuintals + numQuantity) / mandi.dailyCapacityQuintals) * 100));

                return (
                  <div
                    key={mandi.id}
                    onClick={() => setSelectedMandi(mandi.id)}
                    style={{
                      background: isSelected ? '#e6f4ea' : '#f8fafc',
                      border: isSelected ? '3px solid #006837' : '1.5px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(0, 104, 55, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: isSelected ? '#006837' : '#0f172a' }}>
                            {mandi.name}
                          </h4>
                          {isDefaultAssigned ? (
                            <span className="gov-badge badge-green" style={{ fontSize: '0.75rem' }}>
                              ✓ Officially Assigned
                            </span>
                          ) : (
                            <span className="gov-badge badge-blue" style={{ fontSize: '0.72rem' }}>
                              Alternative Center
                            </span>
                          )}
                          {isSelected && (
                            <span className="gov-badge badge-saffron" style={{ fontSize: '0.72rem' }}>
                              Selected
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                          📍 {mandi.distanceKm} km away • {mandi.activeCounters} Counters Active • {mandi.avgProcessingTimeMins} mins avg turnaround
                        </span>
                      </div>
                      <span className={`gov-badge ${capacityPercent > 80 ? 'badge-saffron' : 'badge-green'}`}>
                        {capacityPercent}% Capacity
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

            {bookingError && (
              <div style={{ background: '#fee2e2', border: '2px solid #ef4444', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> {bookingError}
              </div>
            )}

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
              <button 
                className="btn-gov-saffron" 
                onClick={handleBookSlot}
                disabled={isBookingLoading}
                style={{ opacity: isBookingLoading ? 0.7 : 1, cursor: isBookingLoading ? 'wait' : 'pointer' }}
              >
                {isBookingLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Confirming...
                  </>
                ) : (
                  <>
                    Confirm & Generate Staggered Token <Sparkles size={20} />
                  </>
                )}
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
