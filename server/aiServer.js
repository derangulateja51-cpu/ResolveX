/**
 * ResolveX - AI Intake Service Standalone Runner
 * Maintained by Member 5
 * 
 * Runs on AI_SERVER_PORT (default 5001) so it never conflicts with
 * main backend running on PORT 5000.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const aiRoutes = require('./aiRoutes');

const app = express();
const PORT = process.env.AI_SERVER_PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Mount Member 5 AI routes
app.use('/api/ai', aiRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    app: 'IssueHub AI Complaint Intake Microservice',
    status: 'online',
    endpoints: {
      parseComplaint: 'POST /api/ai/parse-complaint',
      health: 'GET /api/ai/health'
    },
    maintainedBy: 'Member 5 (AI Intake & Frontend)'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🤖 IssueHub AI Intake Service running on http://localhost:${PORT}`);
  console.log(`   Endpoint: POST http://localhost:${PORT}/api/ai/parse-complaint`);
  console.log(`   Keep LLM Keys server-side: SUCCESS`);
  console.log(`=======================================================`);
});
