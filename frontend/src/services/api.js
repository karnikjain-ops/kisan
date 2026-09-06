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
