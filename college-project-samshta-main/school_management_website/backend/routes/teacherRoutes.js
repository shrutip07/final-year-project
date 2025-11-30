const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const teacherController = require('../controllers/teacherController');
const { getTeacherNotifications } = require("../controllers/notificationController");

// Get current logged-in teacher's staff profile
router.get('/me', authenticateToken, authorizeRoles('teacher'), teacherController.getMyProfile);
router.get('/students', authenticateToken, authorizeRoles('teacher'), teacherController.getMyStudents);
router.get('/units', authenticateToken, teacherController.getUnits);
router.get('/academic-years', authenticateToken, authorizeRoles('teacher'), teacherController.getAcademicYears);
router.get(
  '/notifications',
  authenticateToken,
  authorizeRoles("teacher"),
  getTeacherNotifications
);
// Profile and onboarding routes
router.put('/profile', authenticateToken, authorizeRoles('teacher'), teacherController.updateProfile);
router.post('/onboard', authenticateToken, authorizeRoles('teacher'), teacherController.onboard);
router.post(
  "/year-done",
  authenticateToken,
  authorizeRoles("teacher"),
  teacherController.markYearDone
);
router.get(
"/classes",
authenticateToken,
authorizeRoles("teacher"),
teacherController.getMyClasses
);
router.put(
"/enrollment/:enrollment_id",
authenticateToken,
authorizeRoles("teacher"),
teacherController.updateEnrollment
);

// ENROLLMENT CRUD (these were missing!)


module.exports = router;
