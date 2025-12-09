const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const {
getSchoolReport,
getReportYears,
getSchoolsByReportFilter,
generateSelectedReport,
getSafetyReport, // ✅ ADD THIS
checkSafetyData // ✅ ADD THIS
} = require("../controllers/reportController");
// Existing single report (backward compatibility)
router.get("/units/:unitId/report", authenticateToken, authorizeRoles("admin"),
getSchoolReport);
// New dynamic reporting endpoints
router.get("/years", authenticateToken, authorizeRoles("admin"), getReportYears);
router.get("/schools", authenticateToken, authorizeRoles("admin"),
getSchoolsByReportFilter);
router.get("/download", authenticateToken, authorizeRoles("admin"),
generateSelectedReport);
router.get("/safety", authenticateToken, authorizeRoles("admin"), getSafetyReport);
router.get("/safety-check", authenticateToken, authorizeRoles("admin"),
checkSafetyData);
module.exports = router;