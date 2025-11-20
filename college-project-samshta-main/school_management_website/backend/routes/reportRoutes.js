const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { getSchoolReport } = require("../controllers/reportController");
router.get(
"/units/:unitId/report",
authenticateToken,
authorizeRoles("admin"),
getSchoolReport
);
module.exports = router;