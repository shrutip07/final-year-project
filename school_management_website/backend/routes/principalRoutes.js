const express = require('express');
const router = express.Router();
//const { authenticateToken } = require('../middleware/auth');
const principalController = require('../controllers/principalController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Principal Onboarding (create profile)
router.post('/onboard', authenticateToken, principalController.onboard);

// Get principal profile
router.get('/me', authenticateToken, principalController.getProfile);

// Update principal profile
router.put('/:principal_id', authenticateToken, principalController.updateProfile);

// Get all teachers
router.get('/teachers', authenticateToken, principalController.getTeachers);

router.get('/dashboard-data', authenticateToken, principalController.getDashboardData);
router.get('/analytics', authenticateToken, authorizeRoles('principal'), principalController.getAnalytics);

// Add this new route
router.get('/students', authenticateToken, principalController.getStudents);

module.exports = router;
