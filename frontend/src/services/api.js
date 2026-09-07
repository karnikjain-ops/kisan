// KisanQueue API Service connecting Frontend to Backend Engine

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchCentres() {
  try {
    const res = await fetch(`${API_BASE}/centres`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('API fetchCentres error, using fallback:', err);
    return null;
  }
}

export async function fetchCrops() {
  try {
    const res = await fetch(`${API_BASE}/crops`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('API fetchCrops error, using fallback:', err);
    return null;
  }
}

export async function fetchFarmerStatus(farmerId = 'FARM-2026-9842') {
  try {
    const res = await fetch(`${API_BASE}/farmers/${farmerId}/status`);
    if (!res.ok) return null;
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('API fetchFarmerStatus error, using fallback:', err);
    return null;
  }
}

export async function fetchSlotAvailabilityApi(centreId = 'mandi-1', date = '2026-09-05') {
  try {
    const res = await fetch(`${API_BASE}/slots/availability?centre_id=${encodeURIComponent(centreId)}&date=${encodeURIComponent(date)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.slots;
  } catch (err) {
    console.warn('API fetchSlotAvailability error, using fallback:', err);
    return null;
  }
}

export async function bookSlotApi(payload) {
  try {
    const res = await fetch(`${API_BASE}/slots/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('API bookSlot error:', err);
    return { success: false, message: err.message };
  }
}

export async function advanceQueueApi(centreId = 'mandi-1') {
  try {
    const res = await fetch(`${API_BASE}/centres/${centreId}/advance-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  } catch (err) {
    console.warn('API advanceQueue error:', err);
    return { success: false, message: err.message };
  }
}

export async function fetchCentreQueueApi(centreId = 'mandi-1') {
  try {
    const res = await fetch(`${API_BASE}/centres/${centreId}/queue`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchCentreQueue error:', err);
    return null;
  }
}

export async function pauseGateApi(centreId = 'mandi-1') {
  try {
    const res = await fetch(`${API_BASE}/centres/${centreId}/pause-gate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  } catch (err) {
    console.warn('API pauseGate error:', err);
    return { success: false, message: err.message };
  }
}

export async function resumeGateApi(centreId = 'mandi-1') {
  try {
    const res = await fetch(`${API_BASE}/centres/${centreId}/resume-gate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  } catch (err) {
    console.warn('API resumeGate error:', err);
    return { success: false, message: err.message };
  }
}

export async function submitQualityCheckApi(payload) {
  try {
    const res = await fetch(`${API_BASE}/quality-checks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.warn('API submitQualityCheck error:', err);
    return { success: false, message: err.message };
  }
}

export async function fetchPaymentByTokenApi(tokenId) {
  try {
    const res = await fetch(`${API_BASE}/payments/by-token/${tokenId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API fetchPaymentByToken error:', err);
    return null;
  }
}

export async function advancePaymentStageApi(paymentId, targetStage) {
  try {
    const res = await fetch(`${API_BASE}/payments/${paymentId}/advance-stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_stage: targetStage })
    });
    return await res.json();
  } catch (err) {
    console.warn('API advancePaymentStage error:', err);
    return { success: false, message: err.message };
  }
}

export async function fetchNotificationsApi(farmerId = 'FARM-2026-9842') {
  try {
    const res = await fetch(`${API_BASE}/notifications?farmer_id=${farmerId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('API fetchNotifications error:', err);
    return null;
  }
}

export async function triggerNotificationApi(payload) {
  try {
    const res = await fetch(`${API_BASE}/notifications/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.warn('API triggerNotification error:', err);
    return { success: false, message: err.message };
  }
}

export async function registerFarmerApi(payload) {
  try {
    const res = await fetch(`${API_BASE}/farmers/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('API registerFarmer error, falling back to local session:', err);
    return {
      success: true,
      message: 'Farmer registered locally (offline fallback)',
      data: {
        farmerId: `FARM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        name: payload.name,
        phone: payload.phone.startsWith('+91') ? payload.phone : `+91 ${payload.phone}`,
        village: payload.village ? `${payload.village}, ${payload.district || 'Karnal'}` : 'Taraori, Karnal',
        aadhaarLast4: (payload.aadhaar || '4821').slice(-4),
        bankAccount: payload.bank_account || `SBI A/C ending ${(payload.aadhaar || '4821').slice(-4)}`,
        ifsc: payload.ifsc || 'SBIN0001234',
        totalLandAcres: parseFloat(payload.area_acres) || 6.5,
        landRecord: {
          khasra: payload.khasra || 'KH-88/14',
          areaAcres: parseFloat(payload.area_acres) || 6.5,
          declaredCrop: payload.declared_crop || 'wheat',
          assignedZoneId: payload.assigned_zone_id || 'ZONE-KARNAL-NORTH',
          verified: true
        }
      }
    };
  }
}

export async function loginFarmerApi(phone, otp) {
  try {
    const res = await fetch(`${API_BASE}/auth/farmer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    return await res.json();
  } catch (err) {
    console.warn('API loginFarmer error, fallback to demo:', err);
    return {
      success: true,
      user: {
        role: 'farmer',
        name: 'Rameshwar Singh',
        farmerId: 'FARM-2026-9842',
        phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        village: 'Taraori, Karnal',
        aadhaarLast4: '4821',
        bankAccount: 'SBI A/C ending 4821',
        ifsc: 'SBIN0001234',
        totalLandAcres: 8.5
      }
    };
  }
}

export async function registerOfficerApi(payload) {
  try {
    const res = await fetch(`${API_BASE}/auth/officer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.warn('API registerOfficer error, fallback to demo:', err);
    return {
      success: true,
      user: {
        role: 'officer',
        name: payload.name,
        officerId: payload.badgeId || 'APMC-KARNAL-402',
        mandiName: payload.mandiName || 'Karnal Central Procurement Mandi',
        mandiId: payload.mandiId || 'mandi-1',
        designation: payload.designation || 'APMC Senior Procurement Superintendent'
      }
    };
  }
}

export async function loginOfficerApi(officerBadge, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/officer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerBadge, password })
    });
    return await res.json();
  } catch (err) {
    console.warn('API loginOfficer error, fallback to demo:', err);
    return {
      success: true,
      user: {
        role: 'officer',
        name: 'Insp. V. K. Sharma',
        officerId: officerBadge || 'APMC-KARNAL-402',
        mandiName: 'Karnal Central Procurement Mandi',
        mandiId: 'mandi-1',
        designation: 'APMC Senior Procurement Superintendent'
      }
    };
  }
}
