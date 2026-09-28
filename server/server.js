/**
 * IssueHub Main Backend Server
 * Production-ready Express API Server on PORT 5000
 * Powers:
 * - Authentication & Role-Based Access Control (Student, Admin, Grievance Officer)
 * - Complaint Lifecycle & State Machine Management
 * - Ombudsman Confidential Grievance Handling
 * - Campus Deflection & Upvote Support
 * - AI Natural-Language Complaint Intake Integration
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const aiRoutes = require('./aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger (Development / Diagnostics)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Root & Health Endpoints
app.get('/', (req, res) => {
  res.json({
    app: 'IssueHub API Backend',
    version: '1.0.0',
    tagline: 'Report. Track. Resolve.',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      complaints: '/api/complaints',
      admin: '/api/admin',
      grievance: '/api/grievance',
      ai: '/api/ai',
      health: '/api/health'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'IssueHub Backend Services',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount Feature API Routers
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/grievance', grievanceRoutes);
app.use('/api/ai', aiRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    error: 'Not Found'
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Internal Error]:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server and Connect DB
async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('=======================================================');
    console.log(`🚀 IssueHub Backend API Server running on http://localhost:${PORT}`);
    console.log(`   Base API URL: http://localhost:${PORT}/api`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log('=======================================================');
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
