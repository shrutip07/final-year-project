/*const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const principalController = require('../controllers/principalController');

// Principal Onboarding (create profile)
router.post('/onboard', authenticateToken, principalController.onboard);

// Get principal profile
router.get('/me', authenticateToken, principalController.getProfile);

// Update principal profile
router.put('/:principal_id', authenticateToken, principalController.updateProfile);

// Get all teachers
router.get('/teachers', authenticateToken, principalController.getTeachers);

router.get('/dashboard-data', authenticateToken, principalController.getDashboardData);

// Add this new route
router.get('/students', authenticateToken, principalController.getStudents);

module.exports = router;
*/
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const principalController = require('../controllers/principalController');
const { getPrincipalNotifications } = require("../controllers/notificationController");

// Principal Onboarding (create profile)
router.post('/onboard', authenticateToken, authorizeRoles("principal"), principalController.onboard);

// Get principal profile
router.get('/me', authenticateToken, authorizeRoles("principal"), principalController.getProfile);

// Update principal profile
router.put('/:principal_id', authenticateToken, authorizeRoles("principal"), principalController.updateProfile);

// Get all teachers
router.get('/teachers', authenticateToken, authorizeRoles("principal"), principalController.getTeachers);


router.get('/dashboard-data', authenticateToken, authorizeRoles("principal"), principalController.getDashboardData);

// Get all students
router.get(
  "/notifications",
  authenticateToken,
  authorizeRoles("principal"),
  getPrincipalNotifications
);


module.exports = router;
