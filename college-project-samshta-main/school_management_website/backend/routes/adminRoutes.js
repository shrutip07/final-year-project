const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Units and their data
router.get('/units', authenticateToken, authorizeRoles('admin'), adminController.getUnits);
router.get('/units/:unitId/teachers', authenticateToken, authorizeRoles('admin'), adminController.getUnitTeachers);
router.get('/units/:unitId/students', authenticateToken, authorizeRoles('admin'), adminController.getUnitStudents);

module.exports = router;
