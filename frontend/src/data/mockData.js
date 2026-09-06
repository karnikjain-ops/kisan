// Mock data for SIH 2026 KisanQueue Platform

export const MANDI_CENTERS = [
  {
    id: "mandi-1",
    name: "Karnal Central Procurement Mandi",
    district: "Karnal",
    state: "Haryana",
    distanceKm: 12,
    dailyCapacityQuintals: 5000,
    currentBookedQuintals: 3450,
    activeCounters: 6,
    avgProcessingTimeMins: 14,
    status: "Normal",
    lat: 29.6857,
    lng: 76.9905,
    gatePhone: "+91 98765 43210"
  },
  {
    id: "mandi-2",
    name: "Kurukshetra Grain Market (APMC)",
    district: "Kurukshetra",
    state: "Haryana",
    distanceKm: 24,
    dailyCapacityQuintals: 4200,
    currentBookedQuintals: 1900,
    activeCounters: 4,
    avgProcessingTimeMins: 10,
    status: "Recommended",
    lat: 29.9695,
    lng: 76.8783,
    gatePhone: "+91 98765 11223"
  },
  {
    id: "mandi-3",
    name: "Ambala City Procurement Hub",
    district: "Ambala",
    state: "Haryana",
    distanceKm: 38,
    dailyCapacityQuintals: 6000,
    currentBookedQuintals: 5800,
    activeCounters: 8,
    avgProcessingTimeMins: 22,
    status: "High Congestion",
    lat: 30.3782,
    lng: 76.7767,
    gatePhone: "+91 98765 99887"
  }
];

export const HOURLY_TRAFFIC_HISTORY = [
  {
    timeSlot: "08:00 AM - 10:00 AM",
    label: "Early Morning (प्रातःकाल)",
    trafficLevel: "Low",
    badgeColor: "badge-green",
    avgWaitMins: 10,
    truckCount: 8,
    isRecommended: true,
    tip: "Best slot with fastest turn-around time (~10 mins wait)."
  },
  {
    timeSlot: "10:00 AM - 01:00 PM",
    label: "Late Morning Rush (दोपहर की भीड़)",
    trafficLevel: "High Rush",
    badgeColor: "badge-saffron",
    avgWaitMins: 35,
    truckCount: 32,
    isRecommended: false,
    tip: "Peak rush period when neighboring village farmers arrive."
  },
  {
    timeSlot: "01:00 PM - 03:00 PM",
    label: "Post-Lunch Slot (दोपहर पश्चात्)",
    trafficLevel: "Moderate",
    badgeColor: "badge-blue",
    avgWaitMins: 18,
    truckCount: 16,
    isRecommended: false,
    tip: "Steady queue clearance post lunch shift."
  },
  {
    timeSlot: "03:00 PM - 06:00 PM",
    label: "Evening Shift (सायंकाल)",
    trafficLevel: "Low",
    badgeColor: "badge-green",
    avgWaitMins: 12,
    truckCount: 9,
    isRecommended: true,
    tip: "Ideal slot for quick weighbridge clearance (~12 mins wait)."
  }
];

export const STAGE_QUEUE_BREAKDOWN = [
  { stageId: 1, name: "Gate Entry Check-in", hindiName: "गेट प्रवेश जांच", currentInQueue: 6, avgMins: 8, statusColor: "#006837" },
  { stageId: 2, name: "Quality Testing Lab", hindiName: "गुणवत्ता परीक्षण लैब", currentInQueue: 8, avgMins: 12, statusColor: "#0b4a8b" },
  { stageId: 3, name: "Weighbridge Scale", hindiName: "धर्मकांटा वजन", currentInQueue: 9, avgMins: 14, statusColor: "#c2410c" },
  { stageId: 4, name: "Receipt & DBT Payment", hindiName: "रसीद एवं डीबीटी भुगतान", currentInQueue: 5, avgMins: 5, statusColor: "#006837" }
];

export const CROP_LIST = [
  { id: "wheat", name: "Wheat (गेहूँ)", mspPerQuintal: 2275, unit: "Quintal", category: "Rabi" },
  { id: "paddy", name: "Paddy Grade A (धान)", mspPerQuintal: 2203, unit: "Quintal", category: "Kharif" },
  { id: "mustard", name: "Mustard (सरसों)", mspPerQuintal: 5650, unit: "Quintal", category: "Rabi" },
  { id: "maize", name: "Maize (मक्का)", mspPerQuintal: 2090, unit: "Quintal", category: "Kharif" },
  { id: "chana", name: "Gram / Chana (चना)", mspPerQuintal: 5440, unit: "Quintal", category: "Rabi" }
];

export const INITIAL_FARMER_PROFILE = {
  farmerId: "FARM-2026-9842",
  name: "Rameshwar Singh",
  phone: "+91 98123 45678",
  village: "Taraori, Karnal",
  aadhaarLast4: "4821",
  bankAccount: "SBI A/C ending 4821",
  ifsc: "SBIN0001234",
  totalLandAcres: 8.5
};

export const INITIAL_TICKETS = [
  {
    tokenId: "KQ-408",
    farmerName: "Rameshwar Singh",
    farmerId: "FARM-2026-9842",
    phone: "+91 98123 45678",
    mandiName: "Karnal Central Procurement Mandi",
    mandiId: "mandi-1",
    cropName: "Wheat (गेहूँ)",
    cropCategory: "wheat",
    quantityQuintals: 45,
    mspRate: 2275,
    estimatedPayout: 102375,
    slotDate: "2026-09-05",
    timeWindow: "10:00 AM - 01:00 PM",
    counterNo: "Counter #3",
    status: "CHECKED_IN",
    currentStepIndex: 2,
    queuePosition: 4,
    estimatedWaitMins: 18,
    transitDistanceKm: 12,
    recommendedDepartureTime: "09:15 AM",
    qrCodeData: "KQ-408-FARM-9842-KARNAL",
    createdTimestamp: "2026-09-04 09:15 AM",
    weighbridgeDetails: {
      grossWeightKg: 4720,
      tareWeightKg: 220,
      netWeightKg: 4500,
      moisturePercent: "11.2%",
      qualityGrade: "Grade A Superfine",
      receiptNo: "JFORM-2026-8812"
    },
    paymentDetails: {
      dbtStatus: "INITIATED",
      txnRef: "DBT-2026-991823",
      amount: 102375,
      settlementDate: "2026-09-05"
    }
  }
];

export const INITIAL_SMS_LOGS = [
  {
    id: "sms-1",
    time: "09:15 AM",
    type: "SLOT_CONFIRMATION",
    title: "✅ Slot Booking Confirmed",
    message: "KisanQueue: Slot Confirmed for Wheat (45 Qt) at Karnal Central Mandi on 05 Sept, 10:00 AM. Token #KQ-408. Show QR code at Gate 1."
  },
  {
    id: "sms-2",
    time: "09:30 AM",
    type: "TRANSIT_ALERT",
    title: "🚗 Depart for Mandi Alert",
    message: "KisanQueue Transit Alert: High gate throughput. Depart now from Taraori to arrive comfortably by 10:00 AM. Your queue position is #4."
  }
];
