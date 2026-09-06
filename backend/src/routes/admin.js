import { Router } from 'express';
import { queryAll, queryOne, run } from '../db/database.js';

const router = Router();

/**
 * GET /api/admin/season-config
 * List all active/historical season configurations
 */
router.get('/season-config', (req, res) => {
  try {
    const configs = queryAll('SELECT * FROM season_configs ORDER BY created_at DESC');
    res.json({ success: true, count: configs.length, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/admin/season-config
 * Create new season configuration (e.g. for newly declared MSP crop)
 */
router.post('/season-config', (req, res) => {
  try {
    const {
      season,
      crop,
      crop_name,
      msp_price,
      moisture_threshold_base,
      moisture_threshold_ceiling,
      discount_rate_per_point,
      registration_window_start,
      registration_window_end,
      procurement_window_start,
      procurement_window_end
    } = req.body;

    const id = `SC-${season.replace(/\s+/g, '-').toUpperCase()}-${crop.toUpperCase()}`;

    run(`
      INSERT INTO season_configs (
        id, season, crop, crop_name, msp_price, moisture_threshold_base,
        moisture_threshold_ceiling, discount_rate_per_point, registration_window_start,
        registration_window_end, procurement_window_start, procurement_window_end, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `, [
      id, season, crop, crop_name, parseFloat(msp_price),
      parseFloat(moisture_threshold_base), parseFloat(moisture_threshold_ceiling),
      parseFloat(discount_rate_per_point), registration_window_start, registration_window_end,
      procurement_window_start, procurement_window_end, new Date().toISOString()
    ]);

    const created = queryOne('SELECT * FROM season_configs WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'Season configuration created', data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/admin/season-config/:id
 * Dynamic administrative revisions (regional moisture relaxations, revised MSP, date extensions)
 */
router.put('/season-config/:id', (req, res) => {
  try {
    const configId = req.params.id;
    const existing = queryOne('SELECT * FROM season_configs WHERE id = ?', [configId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Season configuration not found' });
    }

    const {
      msp_price = existing.msp_price,
      moisture_threshold_base = existing.moisture_threshold_base,
      moisture_threshold_ceiling = existing.moisture_threshold_ceiling,
      discount_rate_per_point = existing.discount_rate_per_point,
      registration_window_start = existing.registration_window_start,
      registration_window_end = existing.registration_window_end,
      procurement_window_start = existing.procurement_window_start,
      procurement_window_end = existing.procurement_window_end,
      is_active = existing.is_active
    } = req.body;

    run(`
      UPDATE season_configs SET
        msp_price = ?,
        moisture_threshold_base = ?,
        moisture_threshold_ceiling = ?,
        discount_rate_per_point = ?,
        registration_window_start = ?,
        registration_window_end = ?,
        procurement_window_start = ?,
        procurement_window_end = ?,
        is_active = ?
      WHERE id = ?
    `, [
      parseFloat(msp_price), parseFloat(moisture_threshold_base),
      parseFloat(moisture_threshold_ceiling), parseFloat(discount_rate_per_point),
      registration_window_start, registration_window_end,
      procurement_window_start, procurement_window_end,
      is_active ? 1 : 0, configId
    ]);

    const updated = queryOne('SELECT * FROM season_configs WHERE id = ?', [configId]);
    res.json({ success: true, message: 'Season configuration updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
