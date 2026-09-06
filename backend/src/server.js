import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import { seedDatabase } from './db/seed.js';
import farmerRoutes from './routes/farmers.js';
import slotRoutes from './routes/slots.js';
import centreRoutes from './routes/centres.js';
import qualityRoutes from './routes/quality.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import cropRoutes from './routes/crops.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Ensure Database Seeded on Boot
seedDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/quality-checks', qualityRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/crops', cropRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'FasalExpress Backend (SIH 2026 PS 26032)',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'FasalExpress Procurement Engine API',
    documentation: '/api/health',
    status: 'Running'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FasalExpress backend running on http://localhost:${PORT}`);
  console.log(`🌾 API Health: http://localhost:${PORT}/api/health`);
});

export default app;
