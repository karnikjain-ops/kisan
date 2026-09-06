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
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';

import { 
  MANDI_CENTERS, 
  CROP_LIST, 
  INITIAL_FARMER_PROFILE, 
  INITIAL_TICKETS, 
  INITIAL_SMS_LOGS 
} from './data/mockData';

import { 
  fetchFarmerStatus, 
  fetchNotificationsApi, 
  advanceQueueApi, 
  triggerNotificationApi 
} from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState({
    role: 'farmer',
    name: 'Rameshwar Singh',
    farmerId: 'FARM-2026-9842',
    phone: '+91 98123 45678',
    village: 'Taraori, Karnal',
    aadhaarLast4: '4821',
    bankAccount: 'SBI A/C ending 4821',
    ifsc: 'SBIN0001234',
    totalLandAcres: 8.5
  });

  const [activeRole, setActiveRole] = useState('farmer');
  const [theme, setTheme] = useState('light');
  const [currentLang, setCurrentLang] = useState('en');
  
  const [farmerProfile, setFarmerProfile] = useState(INITIAL_FARMER_PROFILE);
  const [mandiList] = useState(MANDI_CENTERS);
  const [cropList] = useState(CROP_LIST);

  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [smsLogs, setSmsLogs] = useState(INITIAL_SMS_LOGS);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('farmer');

  const handleOpenAuthModal = (tab = 'farmer') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync initial state from backend if running
  useEffect(() => {
    async function syncBackendData() {
      try {
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
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
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

      {/* Role-Based Authentication & Registration Modal */}
      <AuthModal 
        key={`auth-${authModalTab}-${isAuthModalOpen}`}
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'farmer') {
            setActiveRole('farmer');
            setFarmerProfile(prev => ({
              ...prev,
              name: user.name,
              farmerId: user.farmerId,
              phone: user.phone,
              village: user.village || prev.village,
              aadhaarLast4: user.aadhaarLast4 || prev.aadhaarLast4,
              bankAccount: user.bankAccount || prev.bankAccount,
              ifsc: user.ifsc || prev.ifsc,
              totalLandAcres: user.totalLandAcres || prev.totalLandAcres
            }));
          } else {
            setActiveRole('officer');
          }
        }}
        onRegisterSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'farmer') {
            setActiveRole('farmer');
            setFarmerProfile({
              farmerId: user.farmerId,
              name: user.name,
              phone: user.phone,
              village: user.village || 'Taraori, Karnal',
              aadhaarLast4: user.aadhaarLast4 || '2049',
              bankAccount: user.bankAccount || 'SBI A/C ending 2049',
              ifsc: user.ifsc || 'SBIN0001234',
              totalLandAcres: user.totalLandAcres || 6.5,
              landRecord: user.landRecord
            });

            const welcomeSms = {
              id: `sms-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'REGISTRATION_SUCCESS',
              title: '🎉 PM-KISAN Portal Registration Complete',
              message: `FasalExpress Welcome: ${user.name} (Farmer ID: ${user.farmerId}) registered successfully with verified Khasra land quota (${user.totalLandAcres} Acres). You can now book your seasonal mandi delivery slot!`
            };
            setSmsLogs(prev => [welcomeSms, ...prev]);
          } else {
            setActiveRole('officer');
            const officerSms = {
              id: `sms-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'STAFF_ONBOARDED',
              title: '🏬 APMC Staff Console Activated',
              message: `Officer ${user.name} (${user.officerId || 'Staff'}) authenticated for ${user.mandiName}. Operational console and live queue roster unlocked.`
            };
            setSmsLogs(prev => [officerSms, ...prev]);
          }
        }}
      />
    </div>
  );
}
