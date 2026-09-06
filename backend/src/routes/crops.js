import { Router } from 'express';
import { queryAll } from '../db/database.js';

const router = Router();

/**
 * GET /api/crops
 * List active MSP crops directly from SeasonConfig
 */
router.get('/', (req, res) => {
  try {
    const seasonConfigs = queryAll('SELECT * FROM season_configs WHERE is_active = 1');

    const mapped = seasonConfigs.map(sc => ({
      id: sc.crop,
      name: sc.crop_name,
      mspPerQuintal: sc.msp_price,
      unit: 'Quintal',
      category: sc.season.includes('Rabi') ? 'Rabi' : 'Kharif',
      moistureThresholdBase: sc.moisture_threshold_base,
      moistureThresholdCeiling: sc.moisture_threshold_ceiling,
      discountRatePerPoint: sc.discount_rate_per_point,
      seasonConfigId: sc.id
    }));

    res.json({ success: true, count: mapped.length, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
