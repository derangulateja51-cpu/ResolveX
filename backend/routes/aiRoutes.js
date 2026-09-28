/**
 * IssueHub AI Complaint Intake Routes
 * Endpoint: POST /api/ai/parse-complaint
 */

const express = require('express');
const router = express.Router();
const { parseComplaintIntake } = require('../services/aiService');

// POST /api/ai/parse-complaint
router.post('/parse-complaint', async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.text;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Complaint prompt is required.',
        fallbackToManual: true
      });
    }

    const result = await parseComplaintIntake(prompt);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[AI Route Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during AI processing.',
      fallbackToManual: true
    });
  }
});

// GET /api/ai/health
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'IssueHub AI Complaint Intake Service',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here')
  });
});

module.exports = router;
