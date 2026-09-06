import { Router } from 'express';
import { queryAll, queryOne, run } from '../db/database.js';

const router = Router();

/**
 * GET /api/notifications
 * Fetch recent SMS logs (for SmsSimulator and farmer phone alerts)
 */
router.get('/', (req, res) => {
  try {
    const { farmer_id } = req.query;
    let sql = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    if (farmer_id) {
      sql += ' AND farmer_id = ?';
      params.push(farmer_id);
    }

    sql += ' ORDER BY sent_at DESC LIMIT 50';

    const logs = queryAll(sql, params);

    const formatted = logs.map(l => {
      const dateObj = new Date(l.sent_at);
      const timeStr = isNaN(dateObj.getTime())
        ? 'Just now'
        : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        id: l.id,
        time: timeStr,
        type: l.type,
        title: l.title,
        message: l.message
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/notifications/trigger
 * Triggers a multi-channel alert (SMS / app)
 */
router.post('/trigger', (req, res) => {
  try {
    const {
      farmer_id = 'FARM-2026-9842',
      channel = 'sms',
      type = 'CUSTOM_ALERT',
      title = '📱 FasalExpress Alert',
      message
    } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const id = `sms-${Date.now()}`;
    const now = new Date().toISOString();

    run(`
      INSERT INTO notifications (id, farmer_id, channel, type, title, message, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, farmer_id, channel, type, title, message, now]);

    const created = {
      id,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      title,
      message
    };

    res.status(201).json({ success: true, message: 'Notification dispatched', data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
