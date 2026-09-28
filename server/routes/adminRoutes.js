const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All admin routes require authentication and 'admin' role
router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/complaints', adminController.getAllComplaints);
router.get('/stats', adminController.getStats);
router.patch('/complaints/:id/status', adminController.updateStatus);
router.post('/complaints/:id/resolve', adminController.resolveComplaint);

module.exports = router;
