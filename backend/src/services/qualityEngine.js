/**
 * Quality Assessment Engine for Real MSP Procurement
 * Outcomes:
 * 1. PASS (Within base limit) -> Purchased at full MSP
 * 2. DISCOUNT (Over base limit but under hard ceiling) -> Purchased with per-unit deduction
 * 3. FAIL (Over hard ceiling) -> Terminal Rejection
 */
export function evaluateQuality({
  moisturePct,
  foreignMatterPct = 0.5,
  grossWeightKg,
  tareWeightKg,
  seasonConfig
}) {
  const moisture = parseFloat(moisturePct);
  const foreignMatter = parseFloat(foreignMatterPct);
  const gross = parseFloat(grossWeightKg);
  const tare = parseFloat(tareWeightKg);
  const netWeightKg = Math.max(0, gross - tare);
  const netWeightQuintals = parseFloat((netWeightKg / 100).toFixed(2));

  const {
    msp_price,
    moisture_threshold_base,
    moisture_threshold_ceiling,
    discount_rate_per_point,
    foreign_matter_threshold_base = 0.75,
    foreign_matter_threshold_ceiling = 2.0
  } = seasonConfig;

  // 1. HARD CEILING CHECK -> REJECTION (FAIL)
  if (moisture > moisture_threshold_ceiling) {
    return {
      outcome: 'FAIL',
      qualityGrade: 'Rejected (Excessive Moisture)',
      baseMspRate: msp_price,
      discountAmountPerUnit: 0,
      finalPricePerUnit: 0,
      acceptedQuantityQuintals: 0,
      netWeightKg,
      totalPayout: 0,
      notes: `Rejected: Moisture content (${moisture}%) exceeds hard APMC safety ceiling of ${moisture_threshold_ceiling}%. Farmer advised to aerate and dry crop.`
    };
  }

  if (foreignMatter > foreign_matter_threshold_ceiling) {
    return {
      outcome: 'FAIL',
      qualityGrade: 'Rejected (High Foreign Matter)',
      baseMspRate: msp_price,
      discountAmountPerUnit: 0,
      finalPricePerUnit: 0,
      acceptedQuantityQuintals: 0,
      netWeightKg,
      totalPayout: 0,
      notes: `Rejected: Foreign matter/chaff (${foreignMatter}%) exceeds maximum statutory limit of ${foreign_matter_threshold_ceiling}%.`
    };
  }

  // 2. MARGINAL MOISTURE CHECK -> DISCOUNT
  if (moisture > moisture_threshold_base) {
    const excessMoisturePoints = moisture - moisture_threshold_base;
    const discountPerQuintal = parseFloat((excessMoisturePoints * discount_rate_per_point).toFixed(2));
    const discountedPrice = Math.max(0, msp_price - discountPerQuintal);
    const totalPayout = Math.round(netWeightQuintals * discountedPrice);

    return {
      outcome: 'DISCOUNT',
      qualityGrade: 'Fair Average Quality (FAQ) with Moisture Deduction',
      baseMspRate: msp_price,
      discountAmountPerUnit: discountPerQuintal,
      finalPricePerUnit: discountedPrice,
      acceptedQuantityQuintals: netWeightQuintals,
      netWeightKg,
      totalPayout,
      notes: `Marginal moisture detected: ${moisture}% (standard base: ${moisture_threshold_base}%). Deducted ₹${discountPerQuintal}/Quintal per APMC schedule.`
    };
  }

  // 3. WITHIN STATUTORY BASE LIMIT -> PASS (FULL MSP)
  const totalPayout = Math.round(netWeightQuintals * msp_price);
  return {
    outcome: 'PASS',
    qualityGrade: 'Grade A Superfine',
    baseMspRate: msp_price,
    discountAmountPerUnit: 0,
    finalPricePerUnit: msp_price,
    acceptedQuantityQuintals: netWeightQuintals,
    netWeightKg,
    totalPayout,
    notes: `Passed all quality parameters: Moisture ${moisture}% within base limit of ${moisture_threshold_base}%. Procured at 100% full MSP.`
  };
}
