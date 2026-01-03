
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
  listStudentsForFee,
  updateStudentFeeStatus,
  setTeacherSalary, 
  getAllTeacherSalaries,
  getTeacherSalaryHistory,
  getTeacherSalaryGrid,
  payTeacherSalary,
  getPendingSalaries,
  addStudent,
  listTeachersForClerk,
  updateTeacherRetirement,
  listTeachersForAllocation,
  allocateTeacherClass,
  listPassedStudentsForAllocation,
  allocateStudentNextYear,
  getPhysicalSafetyInfo,
  updatePhysicalSafetyInfo,
  upsertClassCapacity,
  getPhysicalSafetyAnalytics
} = require('../controllers/clerkController');
// Onboarding (create/update profile)
router.post('/onboard', authenticateToken, authorizeRoles('clerk'), onboard);
router.get('/students-for-fee', authenticateToken, authorizeRoles('clerk'), listStudentsForFee);
router.post('/student-fee-status', authenticateToken, authorizeRoles('clerk'), updateStudentFeeStatus);

// Get clerk profile
router.get('/me', authenticateToken, authorizeRoles('clerk'), getProfile);
router.put('/me', authenticateToken, authorizeRoles('clerk'), updateProfile);
// Physical safety info
router.get('/physical-safety', authenticateToken, authorizeRoles('clerk'), getPhysicalSafetyInfo);
router.put('/physical-safety', authenticateToken, authorizeRoles('clerk'), updatePhysicalSafetyInfo);
router.get('/physical-safety/analytics', authenticateToken, authorizeRoles('clerk'), getPhysicalSafetyAnalytics);

// Fee master (set fees for standard & year)
router.get('/fee-master', authenticateToken, authorizeRoles('clerk'), getFeeMaster);
router.post('/fee-master', authenticateToken, authorizeRoles('clerk'), setFeeMaster);

router.get('/teachers', authenticateToken, authorizeRoles('clerk'), listTeachersForClerk);
router.put('/teacher-retirement', authenticateToken, authorizeRoles('clerk'), updateTeacherRetirement);

// Dashboard unit details, teacher/students count
router.get("/unit", authenticateToken, authorizeRoles("clerk"), getUnitDashboard);
router.get('/teacher-salaries', authenticateToken, authorizeRoles('clerk'), getAllTeacherSalaries);
router.get('/teacher-salary-history', authenticateToken, authorizeRoles('clerk'), getTeacherSalaryHistory);
router.post('/teacher-salary', authenticateToken, authorizeRoles('clerk'), setTeacherSalary);
router.get('/teacher-salary-grid', authenticateToken, authorizeRoles('clerk'), getTeacherSalaryGrid);
router.post('/teacher-salary-pay', authenticateToken, authorizeRoles('clerk'), payTeacherSalary);
router.get('/teacher-salary-pending', authenticateToken, authorizeRoles('clerk'), getPendingSalaries);
router.post('/students', authenticateToken, authorizeRoles('clerk'), addStudent);
router.get('/teachers-for-allocation',
  authenticateToken,
  authorizeRoles('clerk'),
  listTeachersForAllocation
);

// 2) Allocate a teacher to a standard/division in a given year
//    POST /api/clerk/allocate-teacher
//    body: { staff_id, academic_year, standard, division }
router.post('/allocate-teacher',
  authenticateToken,
  authorizeRoles('clerk'),
  allocateTeacherClass
);

// 3) List passed students for allocation to next year
//    GET /api/clerk/passed-students?academic_year=2024-25
router.get('/passed-students',
  authenticateToken,
  authorizeRoles('clerk'),
  listPassedStudentsForAllocation
);

// 4) Allocate (promote) a student to next year's standard/division
//    POST /api/clerk/allocate-student-next-year
//    body: { student_id, from_academic_year, to_academic_year, standard, division, roll_number }
router.post('/allocate-student-next-year',
  authenticateToken,
  authorizeRoles('clerk'),
  allocateStudentNextYear
);
// Manage class capacity
router.post('/capacity', authenticateToken, 
  authorizeRoles('clerk'), upsertClassCapacity);

module.exports = router;
module.exports = router;
