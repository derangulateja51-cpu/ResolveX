const express = require('express');
const router = express.Router();
const grievanceController = require('../controllers/grievanceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All grievance routes require authentication and 'grievance_officer' role
router.use(authenticateToken);
router.use(requireRole('grievance_officer'));

router.get('/complaints', grievanceController.getGrievanceComplaints);
router.post('/complaints/:id/resolve', grievanceController.resolveGrievance);

module.exports = router;
