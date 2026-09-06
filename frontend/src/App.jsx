import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FarmerPortal from './components/FarmerPortal';
import SlotBookingModal from './components/SlotBookingModal';
import LiveQueueTracker from './components/LiveQueueTracker';
import PaymentTracker from './components/PaymentTracker';
import SmsSimulator from './components/SmsSimulator';
import MandiOfficerDashboard from './components/MandiOfficerDashboard';
import AnalyticsView from './components/AnalyticsView';
import IvrCallSimulator from './components/IvrCallSimulator';
import Footer from './components/Footer';

import { 
  MANDI_CENTERS, 
  CROP_LIST, 
  INITIAL_FARMER_PROFILE, 
  INITIAL_TICKETS, 
  INITIAL_SMS_LOGS 
} from './data/mockData';

export default function App() {
  const [activeRole, setActiveRole] = useState('farmer');
  const [theme, setTheme] = useState('light');
  const [currentLang, setCurrentLang] = useState('en');
  
  const [farmerProfile] = useState(INITIAL_FARMER_PROFILE);
  const [mandiList] = useState(MANDI_CENTERS);
  const [cropList] = useState(CROP_LIST);

  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [smsLogs, setSmsLogs] = useState(INITIAL_SMS_LOGS);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync initial state from backend if running
  useEffect(() => {
    async function syncBackendData() {
      try {
        const { fetchFarmerStatus, fetchCentres, fetchNotificationsApi } = await import('./services/api');
        const statusRes = await fetchFarmerStatus(farmerProfile.farmerId);
        if (statusRes && statusRes.success && statusRes.tickets && statusRes.tickets.length > 0) {
          setTickets(statusRes.tickets);
        }

        const notifications = await fetchNotificationsApi(farmerProfile.farmerId);
        if (notifications && notifications.length > 0) {
          setSmsLogs(notifications);
        }
      } catch (e) {
        console.warn('Backend sync failed, using default mock state:', e);
      }
    }
    syncBackendData();
  }, [farmerProfile.farmerId]);

  const handleSlotBooked = (newTicket) => {
    setTickets([newTicket, ...tickets]);
    
    const newSms = {
      id: `sms-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'SLOT_CONFIRMATION',
      title: '✅ Slot Booking Confirmed',
      message: `FasalExpress: Slot Confirmed for ${newTicket.cropName} (${newTicket.quantityQuintals} Qt) at ${newTicket.mandiName} on ${newTicket.slotDate}. Token #${newTicket.tokenId}. Channel: ${newTicket.bookingChannel || 'Web Portal'}`
    };
    setSmsLogs([newSms, ...smsLogs]);
  };

  const handleAdvanceQueue = async () => {
    if (!tickets.length) return;
    
    try {
      const { advanceQueueApi } = await import('./services/api');
      await advanceQueueApi(tickets[0]?.mandiId || 'mandi-1');
    } catch (e) {
      console.warn('Advance queue API failed:', e);
    }

    setTickets(prev => prev.map(t => {
      const nextStepIndex = (t.currentStepIndex + 1) % 4;
      const nextPosition = Math.max(1, t.queuePosition - 1);
      return {
        ...t,
        currentStepIndex: nextStepIndex,
        queuePosition: nextPosition,
        estimatedWaitMins: Math.max(5, (nextPosition - 1) * 6),
        status: nextStepIndex === 0 ? 'CHECKED_IN' : nextStepIndex === 1 ? 'IN_PROGRESS' : nextStepIndex === 2 ? 'WEIGHED' : 'COMPLETED'
      };
    }));

    const activeT = tickets[0];
    const newSms = {
      id: `sms-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'QUEUE_ADVANCE',
      title: '⏱️ Queue Update Alert',
      message: `FasalExpress Alert: Counter advanced. Token #${activeT.tokenId} is now step ${activeT.currentStepIndex + 1}/4.`
    };
    setSmsLogs([newSms, ...smsLogs]);
  };

  const handleSendSms = async (smsPayload) => {
    setSmsLogs([smsPayload, ...smsLogs]);
    try {
      const { triggerNotificationApi } = await import('./services/api');
      await triggerNotificationApi({
        farmer_id: farmerProfile.farmerId,
        message: smsPayload.message,
        title: smsPayload.title,
        type: smsPayload.type
      });
    } catch (e) {
      console.warn('Send SMS API failed:', e);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gov-bg)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Government Header & Navigation */}
      <Header 
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        theme={theme}
        setTheme={setTheme}
        ticketCount={tickets.length}
      />

      {/* Main View Container */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {activeRole === 'farmer' && (
          <FarmerPortal 
            farmerProfile={farmerProfile}
            activeTickets={tickets}
            onOpenBookingModal={() => setIsBookingModalOpen(true)}
            onViewQueueTracker={() => setActiveRole('queue')}
            onViewPaymentDetails={() => setActiveRole('payment')}
            mandiList={mandiList}
            cropList={cropList}
            currentLang={currentLang}
          />
        )}

        {activeRole === 'payment' && (
          <PaymentTracker 
            ticket={tickets[0]}
            farmerProfile={farmerProfile}
          />
        )}

        {activeRole === 'ivr' && (
          <IvrCallSimulator 
            onSlotBooked={handleSlotBooked}
            farmerProfile={farmerProfile}
          />
        )}

        {activeRole === 'queue' && (
          <LiveQueueTracker 
            ticket={tickets[0]}
            onAdvanceQueue={handleAdvanceQueue}
            onSimulateSms={() => setActiveRole('sms')}
          />
        )}

        {activeRole === 'officer' && (
          <MandiOfficerDashboard 
            tickets={tickets}
            onAdvanceQueue={handleAdvanceQueue}
            onSendSms={handleSendSms}
            currentLang={currentLang}
          />
        )}

        {activeRole === 'analytics' && (
          <AnalyticsView mandiList={mandiList} currentLang={currentLang} />
        )}

        {activeRole === 'sms' && (
          <SmsSimulator 
            smsLogs={smsLogs}
            onSendSms={handleSendSms}
          />
        )}
      </main>

      {/* Payment Quick Sheet at Bottom of Farmer View */}
      {activeRole === 'farmer' && tickets.length > 0 && (
        <PaymentTracker 
          ticket={tickets[0]}
          farmerProfile={farmerProfile}
        />
      )}

      {/* Government Footer */}
      <Footer />

      {/* Booking Wizard Modal */}
      <SlotBookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        mandiList={mandiList}
        cropList={cropList}
        farmerProfile={farmerProfile}
        onSlotBooked={handleSlotBooked}
      />
    </div>
  );
}
