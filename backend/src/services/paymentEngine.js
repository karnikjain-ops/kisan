/**
 * 6-Stage Payment State Machine for Indian MSP Procurement
 * Stages:
 * 1. gate_pass_issued
 * 2. quality_verified
 * 3. paperwork_matched (J-form/I-form equivalent)
 * 4. produce_lifted
 * 5. payment_initiated (PFMS batch)
 * 6. payment_credited (DBT direct bank credit)
 */

export const PAYMENT_STAGES = [
  {
    stage: 'gate_pass_issued',
    label: 'Gate Pass Issued & Weighbridge Inward',
    hindiLabel: 'गेट पास जारी एवं धर्मकांटा आवक',
    description: 'Vehicle checked in at Mandi Gate with validated token.',
    order: 1
  },
  {
    stage: 'quality_verified',
    label: 'Quality Tested & Grade Approved',
    hindiLabel: 'गुणवत्ता परीक्षण एवं ग्रेड स्वीकृत',
    description: 'Moisture and foreign matter lab analysis completed.',
    order: 2
  },
  {
    stage: 'paperwork_matched',
    label: 'J-Form & Weighbridge Matched',
    hindiLabel: 'जे-फार्म एवं वजन पर्ची मिलान',
    description: 'Official digital J-form generated and verified against scale slip.',
    order: 3
  },
  {
    stage: 'produce_lifted',
    label: 'Produce Lifted from Mandi Storage',
    hindiLabel: 'उपज मंडी गोदाम से उठाई गई',
    description: 'Consignment loaded onto state agency storage/FCI transit trucks.',
    order: 4
  },
  {
    stage: 'payment_initiated',
    label: 'Payment Initiated via PFMS',
    hindiLabel: 'पीएफएमएस भुगतान प्रक्रिया आरंभ',
    description: 'DBT voucher batch file generated and sent to PFMS payment gateway.',
    order: 5
  },
  {
    stage: 'payment_credited',
    label: 'Payment Credited via DBT',
    hindiLabel: 'डीबीटी द्वारा बैंक खाते में जमा',
    description: 'Funds successfully credited into farmer verified bank account.',
    order: 6
  }
];

/**
 * Initializes a full stage history for a newly created payment status record
 */
export function initializeStageHistory(currentStage = 'gate_pass_issued') {
  const now = new Date().toISOString();
  const currentIndex = PAYMENT_STAGES.findIndex(s => s.stage === currentStage);

  return PAYMENT_STAGES.map((s, idx) => ({
    stage: s.stage,
    label: s.label,
    hindiLabel: s.hindiLabel,
    description: s.description,
    timestamp: idx <= currentIndex ? now : null,
    completed: idx <= currentIndex
  }));
}

/**
 * Advances a payment status record to the next stage or a target stage
 */
export function advancePaymentStage(stageHistoryJson, targetStage) {
  const history = typeof stageHistoryJson === 'string' ? JSON.parse(stageHistoryJson) : stageHistoryJson;
  const now = new Date().toISOString();

  let targetIndex = -1;
  if (targetStage) {
    targetIndex = PAYMENT_STAGES.findIndex(s => s.stage === targetStage);
  } else {
    // Find next uncompleted stage
    targetIndex = history.findIndex(s => !s.completed);
  }

  if (targetIndex === -1 || targetIndex >= PAYMENT_STAGES.length) {
    // Already all completed
    return {
      currentStage: PAYMENT_STAGES[PAYMENT_STAGES.length - 1].stage,
      stageHistory: history,
      isFinished: true
    };
  }

  for (let i = 0; i <= targetIndex; i++) {
    if (!history[i].completed) {
      history[i].completed = true;
      history[i].timestamp = now;
    }
  }

  const currentStage = PAYMENT_STAGES[targetIndex].stage;
  return {
    currentStage,
    stageHistory: history,
    isFinished: targetIndex === PAYMENT_STAGES.length - 1
  };
}
