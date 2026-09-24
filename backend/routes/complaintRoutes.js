const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticateToken } = require('../middleware/auth');

// Public
router.get('/known-issues', complaintController.getKnownIssues);

// Protected routes (Student, Admin, Grievance Officer)
router.post('/', authenticateToken, complaintController.createComplaint);
router.get('/my', authenticateToken, complaintController.getMyComplaints);
router.get('/:id', authenticateToken, complaintController.getComplaintById);
router.post('/:id/withdraw', authenticateToken, complaintController.withdrawComplaint);
router.post('/:id/confirm-resolution', authenticateToken, complaintController.confirmResolution);
router.post('/:id/upvote', authenticateToken, complaintController.upvoteComplaint);
router.post('/:id/clarification', authenticateToken, complaintController.addClarification);

module.exports = router;
