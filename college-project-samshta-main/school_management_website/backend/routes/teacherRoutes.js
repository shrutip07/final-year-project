const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const teacherController = require('../controllers/teacherController');

// Get current logged-in teacher's staff profile
router.get('/me', authenticateToken, authorizeRoles('teacher'), teacherController.getMyProfile);
router.get('/students', authenticateToken, authorizeRoles('teacher'), teacherController.getMyStudents);
router.get('/units', authenticateToken, teacherController.getUnits);
// Add this new route
router.put('/profile', authenticateToken, authorizeRoles('teacher'), teacherController.updateProfile);
router.post('/onboard', authenticateToken, authorizeRoles('teacher'), teacherController.onboard);
router.post('/student', authenticateToken, teacherController.addStudent);
router.put('/student/:student_id', authenticateToken, teacherController.updateStudent);

module.exports = router;
