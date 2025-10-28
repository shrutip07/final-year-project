const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const principalController = require('../controllers/principalController');

// Principal Onboarding (create profile)
router.post('/', authenticateToken, authorizeRoles('principal'), principalController.createProfile);

// Get principal profile
router.get('/me', authenticateToken, authorizeRoles('principal'), principalController.getMyProfile);

// Update principal profile
router.put('/:principal_id', authenticateToken, authorizeRoles('principal'), principalController.updateProfile);

// Get all teachers
router.get('/teachers', authenticateToken, authorizeRoles('principal'), principalController.getTeachers);

// Add this new route
router.get('/students', authenticateToken, authorizeRoles('principal'), principalController.getStudents);

module.exports = router;
