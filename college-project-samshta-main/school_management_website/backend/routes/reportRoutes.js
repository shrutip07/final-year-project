const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const {
getSchoolReport,
getAcademicYears
} = require("../controllers/reportController");
// fetch all academic years
router.get(
"/years",
authenticateToken,
authorizeRoles("admin"),
getAcademicYears
);
// report for a unit for a selected year
router.get(
"/units/:unitId/report",
authenticateToken,
authorizeRoles("admin"),
getSchoolReport
);
module.exports = router;