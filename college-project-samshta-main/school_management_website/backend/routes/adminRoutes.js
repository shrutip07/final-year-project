const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Units and their data
router.get('/form-responses', adminController.getAllFormResponses);
router.get('/units', authenticateToken, authorizeRoles('admin'), adminController.getUnits);
router.get('/units/:unitId/teachers', authenticateToken, authorizeRoles('admin'), adminController.getUnitTeachers);
router.get('/units/:unitId/students', authenticateToken, authorizeRoles('admin'), adminController.getUnitStudents);
router.get('/units/:unitId', authenticateToken, authorizeRoles('admin'), adminController.getUnitById);
router.get('/units/:unitId/analytics', authenticateToken, authorizeRoles('admin'), adminController.getUnitAnalytics);
module.exports = router;
