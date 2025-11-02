const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const teacherController = require('../controllers/teacherController');

// Get current logged-in teacher's staff profile
router.get('/me', authenticateToken, authorizeRoles('teacher'), teacherController.getMyProfile);
router.get('/students', authenticateToken, authorizeRoles('teacher'), teacherController.getMyStudents);
router.get('/units', authenticateToken, teacherController.getUnits);
router.get('/academic-years', authenticateToken, authorizeRoles('teacher'), teacherController.getAcademicYears);

// Profile and onboarding routes
router.put('/profile', authenticateToken, authorizeRoles('teacher'), teacherController.updateProfile);
router.post('/onboard', authenticateToken, authorizeRoles('teacher'), teacherController.onboard);

// STUDENT profile CRUD
router.post('/student', authenticateToken, teacherController.addStudent);
router.put('/student/:student_id', authenticateToken, teacherController.updateStudent);

// ENROLLMENT CRUD (these were missing!)
router.post('/enrollment', authenticateToken, teacherController.addEnrollment);   // <---------
router.put('/enrollment/:enrollment_id', authenticateToken, teacherController.updateEnrollment); // <---------

module.exports = router;
