
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const {
  getProfile,
  onboard,
  updateProfile,
  getFeeMaster,
  setFeeMaster,
  getUnitDashboard,
  listStudentsForFee,          // <-- ADD THIS LINE
  updateStudentFeeStatus,
  setTeacherSalary, 
  getAllTeacherSalaries,
  getTeacherSalaryHistory,
    getTeacherSalaryGrid,
    payTeacherSalary,
    getPendingSalaries
} = require('../controllers/clerkController');

// Onboarding (create/update profile)
router.post('/onboard', authenticateToken, authorizeRoles('clerk'), onboard);
router.get('/students-for-fee', authenticateToken, authorizeRoles('clerk'), listStudentsForFee);
router.post('/student-fee-status', authenticateToken, authorizeRoles('clerk'), updateStudentFeeStatus);

// Get clerk profile
router.get('/me', authenticateToken, authorizeRoles('clerk'), getProfile);
router.put('/me', authenticateToken, authorizeRoles('clerk'), updateProfile);

// Fee master (set fees for standard & year)
router.get('/fee-master', authenticateToken, authorizeRoles('clerk'), getFeeMaster);
router.post('/fee-master', authenticateToken, authorizeRoles('clerk'), setFeeMaster);

// Dashboard unit details, teacher/students count
router.get("/unit", authenticateToken, authorizeRoles("clerk"), getUnitDashboard);
router.get('/teacher-salaries', authenticateToken, authorizeRoles('clerk'), getAllTeacherSalaries);
router.get('/teacher-salary-history', authenticateToken, authorizeRoles('clerk'), getTeacherSalaryHistory);
router.post('/teacher-salary', authenticateToken, authorizeRoles('clerk'), setTeacherSalary);
router.get('/teacher-salary-grid', authenticateToken, authorizeRoles('clerk'), getTeacherSalaryGrid);
router.post('/teacher-salary-pay', authenticateToken, authorizeRoles('clerk'), payTeacherSalary);
router.get('/teacher-salary-pending', authenticateToken, authorizeRoles('clerk'), getPendingSalaries);


module.exports = router;
