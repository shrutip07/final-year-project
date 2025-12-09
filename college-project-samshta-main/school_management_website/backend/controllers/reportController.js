const PDFDocument = require("pdfkit");
const pool = require("../config/db");
// ======================================================
// EXISTING ANNUAL REPORT GENERATION
// ======================================================
exports.getSchoolReport = async (req, res) => {
const { unitId } = req.params;
try {
 const unit = await pool.query("SELECT * FROM unit WHERE unit_id = $1", [unitId]);
 if (unit.rowCount === 0) return res.status(404).json({ error: "Unit not found" });
 const school = unit.rows[0];
 const classSummary = await pool.query(
 `
 SELECT e.standard, e.division,
 COUNT(*) AS total,
 SUM(CASE WHEN s.gender='male' THEN 1 ELSE 0 END) AS boys,
 SUM(CASE WHEN s.gender='female' THEN 1 ELSE 0 END) AS girls,
 SUM(CASE WHEN e.passed=true THEN 1 ELSE 0 END) AS passed,
 SUM(CASE WHEN e.passed=false THEN 1 ELSE 0 END) AS failed,
 SUM(CASE WHEN s.admission_date >= DATE_TRUNC('year', CURRENT_DATE) THEN 1 ELSE 0
END) AS new_admissions,
 SUM(CASE WHEN e.roll_number IS NULL THEN 1 ELSE 0 END) AS left_students
 FROM enrollments e
 JOIN students s ON e.student_id = s.student_id
 WHERE s.unit_id = $1
 GROUP BY e.standard, e.division
 ORDER BY e.standard, e.division
 `,
 [unitId]
 );
 const enrollmentHistory = await pool.query(
 `
 SELECT e.academic_year, COUNT(*) AS total
 FROM enrollments e
 JOIN students s ON s.student_id = e.student_id
 WHERE s.unit_id = $1
 GROUP BY e.academic_year
 ORDER BY e.academic_year
 `,
 [unitId]
 );
 const teachers = await pool.query(
 `
 SELECT DISTINCT e.standard, e.division, ''::text AS class_teacher
 FROM enrollments e
 JOIN students s ON s.student_id = e.student_id
 WHERE s.unit_id = $1
 ORDER BY e.standard, e.division
 `,
 [unitId]
 );
 const admissions = await pool.query(
 `
 SELECT EXTRACT(YEAR FROM admission_date) AS year, COUNT(*) AS total
 FROM students
 WHERE unit_id = $1
 GROUP BY year
 ORDER BY year
 `,
 [unitId]
 );
 const doc = new PDFDocument({ margin: 40, size: 'A4' });
 res.setHeader("Content-Type", "application/pdf");
 res.setHeader(
 "Content-Disposition",
 `attachment; filename=School_Report_Unit_${unitId}.pdf`
 );
 doc.pipe(res);
 const section = (title) => {
 doc.moveDown(1.5);
 doc.font("Helvetica-Bold").fontSize(14).fillColor("#2C3E50").text(title);
 doc.moveDown(0.5);
 };
 const drawTable = (headers, rows) => {
 if (rows.length === 0) return;

 const tableWidth = doc.page.width - doc.options.margin * 2;
 const colWidth = tableWidth / headers.length;
 const startX = doc.options.margin;
 let y = doc.y;
 if (y > doc.page.height - 150) {
 doc.addPage();
 y = doc.options.margin;
 }
 doc.rect(startX, y, tableWidth, 25).fill("#34495E");
 doc.fillColor("white").font("Helvetica-Bold").fontSize(9);
 headers.forEach((h, i) => {
 doc.text(h, startX + i * colWidth + 5, y + 8, {
 width: colWidth - 10,
 align: 'center'
 });
 });
 y += 27;
 rows.forEach((row, idx) => {
 const isEven = idx % 2 === 0;
 const rowHeight = 22;

 if (y > doc.page.height - 100) {
 doc.addPage();
 y = doc.options.margin;

 doc.rect(startX, y, tableWidth, 25).fill("#34495E");
 doc.fillColor("white").font("Helvetica-Bold").fontSize(9);
 headers.forEach((h, i) => {
 doc.text(h, startX + i * colWidth + 5, y + 8, {
 width: colWidth - 10,
 align: 'center'
 });
 });
 y += 27;
 }

 doc.rect(startX, y, tableWidth, rowHeight).fill(isEven ? "#ECF0F1" : "white");
 doc.fillColor("#2C3E50").font("Helvetica").fontSize(9);
 headers.forEach((h, i) => {
 const key = h.toLowerCase().replace(/\s+/g, "_");
 const value = String(row[key] ?? "");
 doc.text(value, startX + i * colWidth + 5, y + 6, {
 width: colWidth - 10,
 align: 'center'
 });
 });
 y += rowHeight;
 });
 doc.moveDown(1.5);
 doc.x = doc.options.margin;
 doc.y = y + 10;
 };
 doc.font("Helvetica-Bold").fontSize(20).fillColor("#2C3E50")
 .text("School Annual Academic and Enrollment Report", { align: "center" });
 doc.moveDown(1);

 doc.font("Helvetica").fontSize(11).fillColor("#34495E");
 doc.text(`School Name: ${school.kendrashala_name}`);
 doc.text(`SEMIS No: ${school.semis_no || "NA"}`);
 doc.text(`Management: ${school.type_of_management || "NA"}`);
 doc.text(`Jurisdiction: ${school.school_jurisdiction || "NA"}`);

 doc.moveDown(0.5);
 doc.moveTo(40, doc.y).lineTo(doc.page.width - 40,
doc.y).strokeColor("#BDC3C7").stroke();
 section("1. Class Wise Summary");
 drawTable(
 ["Std", "Div", "Total", "Boys", "Girls", "New", "Left", "Passed", "Failed"],
 classSummary.rows.map((r) => ({
 std: r.standard,
 div: r.division,
 total: r.total,
 boys: r.boys,
 girls: r.girls,
 new: r.new_admissions,
 left: r.left_students,
 passed: r.passed,
 failed: r.failed,
 }))
 );
 section("2. Academic Result Summary");
 drawTable(
 ["Std", "Div", "Passed", "Failed"],
 classSummary.rows.map((r) => ({
 std: r.standard,
 div: r.division,
 passed: r.passed,
 failed: r.failed,
 }))
 );
 section("3. Teacher Assignment per Class");
 drawTable(
 ["Standard", "Division", "Class Teacher"],
 teachers.rows.map((r) => ({
 standard: r.standard,
 division: r.division,
 class_teacher: r.class_teacher,
 }))
 );
 section("4. Enrollment History");
 drawTable(
 ["Year", "Total"],
 enrollmentHistory.rows.map((r) => ({
 year: r.academic_year,
 total: r.total,
 }))
 );

 section("5. Admission Summary");
 drawTable(
 ["Year", "Admissions"],
 admissions.rows.map((r) => ({ year: r.year, admissions: r.total }))
 );
 doc.moveDown(2);
 doc.fontSize(8).fillColor("#95A5A6")
 .text(`Generated on ${new Date().toLocaleString("en-IN")}`, { align: "center" });
 doc.end();
} catch (error) {
 console.log(error);
 res.status(500).json({ error: "Failed to generate report" });
}
};
// ======================================================
// FETCH YEAR LIST
// ======================================================
exports.getReportYears = async (req, res) => {
try {
 const years = await pool.query(
 `SELECT DISTINCT academic_year FROM enrollments WHERE academic_year IS NOT NULL
ORDER BY academic_year DESC`
 );
 if (years.rows.length === 0) {
 return res.json(["2024-25", "2023-24", "2022-23"]);
 }
 res.json(years.rows.map(y => y.academic_year));
} catch (err) {
 console.error(err);
 res.status(500).json({ error: "Error fetching years" });
}
};
// ======================================================
// Filter schools per report
// ======================================================
exports.getSchoolsByReportFilter = async (req, res) => {
const { year, type } = req.query;
try {
 const schools = await pool.query(`SELECT unit_id, kendrashala_name FROM unit ORDER
BY kendrashala_name ASC`);
 const results = [];
 for (const s of schools.rows) {
 let status = "missing";
 if (type === "annual") {
 const q = await pool.query(
 `SELECT COUNT(*) FROM enrollments e
 JOIN students st ON st.student_id = e.student_id
 WHERE st.unit_id=$1 AND e.academic_year=$2`,
 [s.unit_id, year]
 );
 status = q.rows[0].count > 0 ? "complete" : "missing";
 }
 if (type === "payroll") {
 const q = await pool.query(
 `SELECT COUNT(*) FROM salary_payments WHERE unit_id=$1 AND year=$2`,
 [s.unit_id, year.split("-")[0]]
 );
 status = q.rows[0].count > 0 ? "complete" : "missing";
 }
 if (type === "finance") {
 const q = await pool.query(
 `SELECT COUNT(*) FROM unit_budgets WHERE unit_id=$1 AND fiscal_year=$2`,
 [s.unit_id, year]
 );
 status = q.rows[0].count > 0 ? "complete" : "missing";
 }
 if (type === "safety") {
 const q = await pool.query(
 `SELECT
 (SELECT COUNT(*) FROM fire_safety WHERE unit_id=$1) +
 (SELECT COUNT(*) FROM physical_safety WHERE unit_id=$1) +
 (SELECT COUNT(*) FROM medical_readiness WHERE unit_id=$1) +
 (SELECT COUNT(*) FROM surveillance WHERE unit_id=$1) +
 (SELECT COUNT(*) FROM emergency_response WHERE unit_id=$1) +
 (SELECT COUNT(*) FROM compliance_certificates WHERE unit_id=$1)
 AS total_records`,
 [s.unit_id]
 );
 status = parseInt(q.rows[0].total_records) > 0 ? "complete" : "missing";
 }
 results.push({
 unit_id: s.unit_id,
 school_name: s.kendrashala_name,
 status,
 });
 }
 res.json(results);
} catch (err) {
 console.error(err);
 res.status(500).json({ error: "Error fetching report availability" });
}
};
// ======================================================
// 🔥 GENERATE SELECTED REPORT (PAYROLL / FINANCE / ANNUAL / SAFETY)
// ======================================================
exports.generateSelectedReport = async (req, res) => {
const { unit, year, type } = req.query;
try {
 if (!unit || !year || !type) {
 return res.status(400).json({ error: "Missing params" });
 }
 if (type === "annual") {
 return exports.getSchoolReport({ params: { unitId: unit } }, res);
 }
 if (type === "safety") {
 return exports.getSafetyReport({ query: { unit, year } }, res);
 }
 const schoolData = await pool.query(
 `SELECT kendrashala_name FROM unit WHERE unit_id=$1`,
 [unit]
 );
 if (schoolData.rowCount === 0) {
 return res.status(404).json({ error: "School not found" });
 }
 const schoolName = schoolData.rows[0].kendrashala_name;
 if (type === "payroll") {
 const payrollData = await pool.query(
 `SELECT
 st.full_name,
 st.designation,
 sp.year,
 sp.month,
 sp.amount,
 sp.paid_on
 FROM salary_payments sp
 JOIN staff st ON st.staff_id = sp.staff_id
 WHERE sp.unit_id = $1 AND sp.year = $2
 ORDER BY sp.month ASC, st.full_name`,
 [unit, parseInt(year.split("-")[0])]
 );
 const doc = new PDFDocument({ margin: 40, size: "A4" });
 res.setHeader("Content-Type", "application/pdf");
 res.setHeader(
 "Content-Disposition",
 `attachment; filename=${schoolName.replace(/\s+/g, "_")}_Payroll_${year}.pdf`
 );
 doc.pipe(res);
 doc.font("Helvetica-Bold").fontSize(20).fillColor("#2C3E50").text(schoolName, {
align: "center" });
 doc.moveDown(0.5);
 doc.fontSize(16).fillColor("#34495E").text("STAFF PAYROLL REPORT", { align:
"center" });
 doc.fontSize(12).fillColor("#7F8C8D").text(`Academic Year: ${year}`, { align:
"center" });
 doc.moveDown(1.5);
 if (payrollData.rows.length === 0) {
 doc.font("Helvetica").fontSize(12).fillColor("#E74C3C")
 .text("No payroll data available for this period.", { align: "center" });
 } else {
 const tableTop = doc.y;
 const rowHeight = 25;
 let y = tableTop;
 doc.rect(40, y, doc.page.width - 80, rowHeight).fill("#34495E");
 doc.fillColor("white").font("Helvetica-Bold").fontSize(10);
 doc.text("Staff Name", 50, y + 8, { width: 140 });
 doc.text("Designation", 200, y + 8, { width: 100 });
 doc.text("Month", 310, y + 8, { width: 60 });
 doc.text("Amount (₹)", 380, y + 8, { width: 80 });
 doc.text("Paid On", 470, y + 8, { width: 80 });
 y += rowHeight;
 let totalAmount = 0;
 payrollData.rows.forEach((row, index) => {
 const bgColor = index % 2 === 0 ? "#ECF0F1" : "#FFFFFF";
 doc.rect(40, y, doc.page.width - 80, rowHeight).fill(bgColor);
 doc.fillColor("#2C3E50").font("Helvetica").fontSize(9);
 doc.text(row.full_name || "N/A", 50, y + 8, { width: 140 });
 doc.text(row.designation || "-", 200, y + 8, { width: 100 });
 doc.text(`${row.month}/${row.year}`, 310, y + 8, { width: 60 });
 doc.text(Number(row.amount).toLocaleString("en-IN"), 380, y + 8, { width: 80
});
 doc.text(
 row.paid_on ? new Date(row.paid_on).toLocaleDateString("en-IN") :
"Pending",
 470,
 y + 8,
 { width: 80 }
 );
 totalAmount += Number(row.amount);
 y += rowHeight;
 if (y > doc.page.height - 100) {
 doc.addPage();
 y = 40;
 }
 });
 doc.moveDown(2);
 doc.font("Helvetica-Bold").fontSize(13).fillColor("#16A085")
 .text(`Total Payroll: ₹${totalAmount.toLocaleString("en-IN")}`, { align:
"right" });
 }
 doc.moveDown(3);
 doc.fontSize(8).fillColor("#95A5A6")
 .text(`Generated on ${new Date().toLocaleString("en-IN")}`, { align: "center"
});
 doc.end();
 return;
 }
 if (type === "finance") {
 const financeData = await pool.query(
 `SELECT * FROM unit_budgets WHERE unit_id = $1 AND fiscal_year = $2`,
 [unit, year]
 );
 const doc = new PDFDocument({ margin: 40, size: "A4" });
 res.setHeader("Content-Type", "application/pdf");
 res.setHeader(
 "Content-Disposition",
 `attachment; filename=${schoolName.replace(/\s+/g, "_")}_Finance_${year}.pdf`
 );
 doc.pipe(res);
 doc.font("Helvetica-Bold").fontSize(20).fillColor("#2C3E50").text(schoolName, {
align: "center" });
 doc.moveDown(0.5);
 doc.fontSize(16).fillColor("#34495E").text("FINANCIAL ALLOCATION REPORT", {
align: "center" });
 doc.fontSize(12).fillColor("#7F8C8D").text(`Fiscal Year: ${year}`, { align:
"center" });
 doc.moveDown(1.5);
 if (financeData.rows.length === 0) {
 doc.font("Helvetica").fontSize(12).fillColor("#E74C3C")
 .text("No financial data available for this period.", { align: "center" });
 } else {
 financeData.rows.forEach((row, idx) => {
 doc.font("Helvetica-Bold").fontSize(13).fillColor("#2C3E50")
 .text(`Budget Record ${idx + 1} (${row.version})`, { underline: true });
 doc.moveDown(0.5);
 doc.font("Helvetica").fontSize(11).fillColor("#34495E");
 doc.fillColor("#27AE60").text("Total Income:", 50, doc.y);
 doc.fillColor("#2C3E50").text(`₹${Number(row.income ||
0).toLocaleString("en-IN")}`, 200, doc.y - 11);
 doc.moveDown(0.5);
 doc.fillColor("#E67E22").text("Total Expenses:", 50, doc.y);
 doc.fillColor("#2C3E50").text(`₹${Number(row.expenses ||
0).toLocaleString("en-IN")}`, 200, doc.y - 11);
 doc.moveDown(0.5);
 const surplus = Number(row.surplus || 0);
 doc.fillColor(surplus >= 0 ? "#16A085" : "#E74C3C").text("Surplus/Deficit:",
50, doc.y);
 doc.fillColor(surplus >= 0 ? "#16A085" : "#E74C3C")
 .text(`₹${surplus.toLocaleString("en-IN")}`, 200, doc.y - 11);
 doc.moveDown(1.5);
 });
 }
 doc.moveDown(2);
 doc.fontSize(8).fillColor("#95A5A6")
 .text(`Generated on ${new Date().toLocaleString("en-IN")}`, { align: "center"
});
 doc.end();
 return;
 }
 res.status(400).json({ error: "Invalid report type" });
} catch (err) {
 res.status(500).json({ error: "Error generating report: " + err.message });
}
};
// ======================================================
// 🛡️ SCHOOL SAFETY REPORT - MOVED OUTSIDE
// ======================================================
exports.getSafetyReport = async (req, res) => {
const { unit, year } = req.query;
console.log("🛡️ Generating Safety Report for Unit:", unit, "Year:", year);
try {
 if (!unit || !year) {
 return res.status(400).json({ error: "Missing params" });
 }
 // Get school info
 const schoolData = await pool.query(
 `SELECT kendrashala_name FROM unit WHERE unit_id=$1`,
 [unit]
 );
 if (schoolData.rowCount === 0) {
 return res.status(404).json({ error: "School not found" });
 }
 const schoolName = schoolData.rows[0].kendrashala_name;
 // Fetch all safety data
 const fireSafety = await pool.query(
 `SELECT * FROM fire_safety WHERE unit_id=$1`,
 [unit]
 );
 const fireDrills = await pool.query(
 `SELECT * FROM fire_drill WHERE unit_id=$1 ORDER BY drill_date DESC LIMIT 1`,
 [unit]
 );
 const physicalSafety = await pool.query(
 `SELECT * FROM physical_safety WHERE unit_id=$1`,
 [unit]
 );
 const medicalReadiness = await pool.query(
 `SELECT * FROM medical_readiness WHERE unit_id=$1`,
 [unit]
 );
 const surveillance = await pool.query(
 `SELECT * FROM surveillance WHERE unit_id=$1`,
 [unit]
 );
 const emergencyResponse = await pool.query(
 `SELECT * FROM emergency_response WHERE unit_id=$1`,
 [unit]
 );
 const certificates = await pool.query(
 `SELECT * FROM compliance_certificates WHERE unit_id=$1 ORDER BY expiry_date`,
 [unit]
 );
 // Calculate Safety Score
 let score = 0;
 let maxScore = 100;
 // Fire Safety (20 points)
 if (fireSafety.rows.length > 0) {
 const fs = fireSafety.rows[0];
 if (fs.extinguisher_count >= 10) score += 5;
 if (
 fs.extinguisher_last_inspection &&
 new Date(fs.extinguisher_last_inspection) >
 new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
 )
 score += 5;
 if (fs.evacuation_routes_marked) score += 5;
 if (fireDrills.rows.length > 0) score += 5;
 }
 // Physical Infrastructure (25 points)
 if (physicalSafety.rows.length > 0) {
 const ps = physicalSafety.rows[0];
 if (
 ps.building_compliance_date &&
 new Date(ps.building_compliance_date) >
 new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
 )
 score += 10;
 if (ps.stairs_condition === "good" || ps.stairs_condition === "excellent")
 score += 5;
 if (
 ps.playground_status === "good" ||
 ps.playground_status === "excellent"
 )
 score += 5;
 if (
 ps.last_water_quality_test &&
 new Date(ps.last_water_quality_test) >
 new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
 )
 score += 5;
 }
 // Medical Readiness (20 points)
 if (medicalReadiness.rows.length > 0) {
 const mr = medicalReadiness.rows[0];
 if (mr.first_aid_kits_count >= 3) score += 5;
 if (mr.trained_first_aiders_count >= 5) score += 5;
 if (mr.ambulance_access) score += 5;
 if (mr.emergency_contact_numbers) score += 5;
 }
 // Surveillance (15 points)
 if (surveillance.rows.length > 0) {
 const sv = surveillance.rows[0];
 if (sv.cctv_cameras_count >= 10) score += 5;
 if (sv.cctv_working_count >= sv.cctv_cameras_count * 0.8) score += 5;
 if (sv.security_guards_count >= 2) score += 5;
 }
 // Emergency Response (10 points)
 if (emergencyResponse.rows.length > 0) {
 const er = emergencyResponse.rows[0];
 if (er.emergency_plan_document) score += 3;
 if (er.emergency_drills_per_year >= 2) score += 4;
 if (er.disaster_management_committee) score += 3;
 }
 // Certifications (10 points)
 const validCerts = certificates.rows.filter(
 (c) => c.status === "valid" && new Date(c.expiry_date) > new Date()
 );
 score += Math.min(10, validCerts.length * 2);
 const scorePercentage = Math.round((score / maxScore) * 100);
 const scoreStatus =
 scorePercentage >= 80
 ? "Excellent"
 : scorePercentage >= 60
 ? "Good"
 : "Needs Improvement";
 const scoreColor =
 scorePercentage >= 80
 ? "#27AE60"
 : scorePercentage >= 60
 ? "#F39C12"
 : "#E74C3C";
 // Generate PDF
 const doc = new PDFDocument({ margin: 40, size: "A4" });
 res.setHeader("Content-Type", "application/pdf");
 res.setHeader(
 "Content-Disposition",
 `attachment; filename=${schoolName.replace(/\s+/g, "_")}_Safety_${year}.pdf`
 );
 doc.pipe(res);
 // Header
 doc
 .font("Helvetica-Bold")
 .fontSize(20)
 .fillColor("#2C3E50")
 .text(schoolName, { align: "center" });
 doc.moveDown(0.5);
 doc
 .fontSize(16)
 .fillColor("#34495E")
 .text("SCHOOL SAFETY & COMPLIANCE REPORT", { align: "center" });
 doc
 .fontSize(12)
 .fillColor("#7F8C8D")
 .text(`Academic Year: ${year}`, { align: "center" });
 doc.moveDown(1.5);
 // Line separator
 doc
 .moveTo(40, doc.y)
 .lineTo(doc.page.width - 40, doc.y)
 .strokeColor("#BDC3C7")
 .stroke();
 doc.moveDown(1);
 // Overall Safety Score
 doc
 .font("Helvetica-Bold")
 .fontSize(16)
 .fillColor("#2C3E50")
 .text("OVERALL SAFETY SCORE", { align: "center" });
 doc.moveDown(0.5);
 doc.fontSize(32).fillColor(scoreColor).text(`${scorePercentage}%`, {
 align: "center",
 });
 doc
 .fontSize(14)
 .fillColor("#7F8C8D")
 .text(`Status: ${scoreStatus}`, { align: "center" });
 doc.moveDown(1);
 // Progress bar
 const barWidth = 400;
 const barHeight = 20;
 const barX = (doc.page.width - barWidth) / 2;
 const barY = doc.y;
 doc.rect(barX, barY, barWidth, barHeight).stroke("#BDC3C7");
 doc
 .rect(barX, barY, (barWidth * scorePercentage) / 100, barHeight)
 .fill(scoreColor);
 doc.moveDown(2);
 doc
 .moveTo(40, doc.y)
 .lineTo(doc.page.width - 40, doc.y)
 .strokeColor("#BDC3C7")
 .stroke();
 doc.moveDown(1);
 // Helper function for info boxes
 // INFO BOX
const infoBox = (title, data) => {
// Add spacing before each new block
doc.moveDown(1);
// Section title with proper spacing
doc
 .font("Helvetica-Bold")
 .fontSize(12)
 .fillColor("#2C3E50")
 .text(title, 50, doc.y); // left aligned title
doc.moveDown(0.4);
// Measure height dynamically based on wrapped content
let rows = Object.values(data).map((v) => {
 const lines = Math.ceil(String(v).length / 45);
 return lines * 16;
});
const boxHeight = rows.reduce((a, b) => a + b, 30);
const startY = doc.y;
const boxX = 50;
const boxWidth = doc.page.width - 100;
// Draw rounded box
doc.roundedRect(boxX, startY, boxWidth, boxHeight, 6).stroke("#BDC3C7");
let y = startY + 10;
Object.entries(data).forEach(([key, value]) => {
 // FIX: keep key on one line and never wrap
 doc
 .font("Helvetica-Bold")
 .fontSize(9)
 .fillColor("#7F8C8D")
 .text(key, boxX + 10, y, { width: 140, continued: false });
 // Allow wrapping only for value
 doc
 .font("Helvetica")
 .fontSize(9)
 .fillColor("#2C3E50")
 .text(String(value), boxX + 160, y, {
 width: boxWidth - 180,
 lineGap: 2,
 });
 y += 18;
});
doc.y = startY + boxHeight + 10;
};
 // Fire Safety
 if (fireSafety.rows.length > 0) {
 const fs = fireSafety.rows[0];
 const lastDrill = fireDrills.rows.length > 0 ? fireDrills.rows[0] : null;
 infoBox("FIRE SAFETY STATUS", {
 Extinguishers: `${fs.extinguisher_count || 0} units`,
 Locations: fs.extinguisher_locations || "N/A",
 "Last Inspection": fs.extinguisher_last_inspection
 ? new Date(fs.extinguisher_last_inspection).toLocaleDateString(
 "en-IN"
 )
 : "N/A",
 "Evacuation Routes": fs.evacuation_routes_marked
 ? "Marked"
 : "Not Marked",
 "Assembly Points": fs.assembly_points || "N/A",
 "Recent Fire Drill": lastDrill
 ? `${new Date(lastDrill.drill_date).toLocaleDateString(
 "en-IN"
 )} (${lastDrill.evacuation_time_seconds}s)`
 : "No drills recorded",
 });
 } else {
 doc
 .font("Helvetica")
 .fontSize(11)
 .fillColor("#E74C3C")
 .text("No fire safety data available");
 doc.moveDown(1);
 }
 // Physical Infrastructure
 if (physicalSafety.rows.length > 0) {
 const ps = physicalSafety.rows[0];
 infoBox("PHYSICAL INFRASTRUCTURE", {
 "Building Certificate": ps.building_compliance_date
 ? `Valid till ${new Date(
 ps.building_compliance_date
 ).toLocaleDateString("en-IN")}`
 : "N/A",
 Stairs: `${ps.stairs_count || 0} units - ${
 ps.stairs_condition || "N/A"
 }`,
 Ramps: `${ps.ramps_count || 0} units - ${
 ps.ramps_condition || "N/A"
 }`,
 Handrails: `${ps.handrails_count || 0} units - ${
 ps.handrails_condition || "N/A"
 }`,
 Playground: ps.playground_status || "N/A",
 "Water Outlets": `${ps.drinking_water_outlets || 0} points`,
 "Water Quality Test": ps.last_water_quality_test
 ? new Date(ps.last_water_quality_test).toLocaleDateString("en-IN")
 : "N/A",
 "Toilets (B/G)": `${ps.toilets_boys || 0} / ${
 ps.toilets_girls || 0
 }`,
 "Sanitation Check": ps.last_sanitation_check
 ? new Date(ps.last_sanitation_check).toLocaleDateString("en-IN")
 : "N/A",
 Lighting: ps.lighting_status || "N/A",
 Ventilation: ps.ventilation_status || "N/A",
 });
 }
 if (doc.y > doc.page.height - 200) {
 doc.addPage();
 }
 // Medical Readiness
 if (medicalReadiness.rows.length > 0) {
 const mr = medicalReadiness.rows[0];
 infoBox("MEDICAL READINESS", {
 "First Aid Kits": `${mr.first_aid_kits_count || 0} kits`,
 "Kit Locations": mr.first_aid_kit_locations || "N/A",
 "Last Inspection": mr.last_kit_inspection
 ? new Date(mr.last_kit_inspection).toLocaleDateString("en-IN")
 : "N/A",
 "Trained Staff": `${mr.trained_first_aiders_count || 0} people`,
 "Ambulance Access": mr.ambulance_access
 ? "Available"
 : "Not Available",
 "Nearest Hospital": mr.nearest_hospital_name
 ? `${mr.nearest_hospital_name} (${mr.nearest_hospital_distance_km} km)`
 : "N/A",
 "Emergency Contacts": mr.emergency_contact_numbers || "N/A",
 });
 }
 // Surveillance
 if (surveillance.rows.length > 0) {
 const sv = surveillance.rows[0];
 infoBox("SURVEILLANCE & SECURITY", {
 "CCTV Cameras": `${sv.cctv_working_count || 0} / ${
 sv.cctv_cameras_count || 0
 } working`,
 "Coverage Areas": sv.cctv_coverage_areas || "N/A",
 "Last Maintenance": sv.cctv_last_maintenance
 ? new Date(sv.cctv_last_maintenance).toLocaleDateString("en-IN")
 : "N/A",
 "Recording Retention": `${sv.recording_retention_days || 0} days`,
 "Security Guards": `${sv.security_guards_count || 0} personnel (${
 sv.security_guard_shift || "N/A"
 })`,
 "Visitor Log": sv.visitor_log_maintained
 ? "Maintained"
 : "Not Maintained",
 });
 }
 // Emergency Response
 if (emergencyResponse.rows.length > 0) {
 const er = emergencyResponse.rows[0];
 infoBox("EMERGENCY RESPONSE PREPAREDNESS", {
 "Emergency Plan": er.emergency_plan_document
 ? "Available"
 : "Not Available",
 "Plan Last Updated": er.emergency_plan_last_updated
 ? new Date(er.emergency_plan_last_updated).toLocaleDateString(
 "en-IN"
 )
 : "N/A",
 "Drills Per Year": `${er.emergency_drills_per_year || 0} drills`,
 "Last Mock Drill": er.last_mock_drill_date
 ? new Date(er.last_mock_drill_date).toLocaleDateString("en-IN")
 : "N/A",
 "CPR Trained Staff": `${er.staff_trained_in_cpr_count || 0} people`,
 "Disaster Committee": er.disaster_management_committee
 ? "Established"
 : "Not Established",
 "Committee Members": er.committee_members || "N/A",
 });
 }
 // Government Certifications
 if (certificates.rows.length > 0) {
 doc
 .font("Helvetica-Bold")
 .fontSize(14)
 .fillColor("#34495E")
 .text("GOVERNMENT CERTIFICATIONS");
 doc.moveDown(0.5);
 const tableTop = doc.y;
 const rowHeight = 25;
 let y = tableTop;
 doc
 .rect(40, y, doc.page.width - 80, rowHeight)
 .fill("#34495E");
 doc.fillColor("white").font("Helvetica-Bold").fontSize(10);
 doc.text("Certificate Type", 50, y + 8, { width: 150 });
 doc.text("Number", 210, y + 8, { width: 100 });
 doc.text("Status", 320, y + 8, { width: 80 });
 doc.text("Expiry Date", 410, y + 8, { width: 130 });
 y += rowHeight;
 certificates.rows.forEach((cert, index) => {
 const bgColor = index % 2 === 0 ? "#ECF0F1" : "#FFFFFF";
 doc.rect(40, y, doc.page.width - 80, rowHeight).fill(bgColor);
 const isExpired = new Date(cert.expiry_date) < new Date();
 const statusText =
 cert.status === "valid" && !isExpired ? "Valid" : "Expired";
 const statusColor =
 cert.status === "valid" && !isExpired ? "#27AE60" : "#E74C3C";
 doc.fillColor("#2C3E50").font("Helvetica").fontSize(9);
 doc.text(cert.certificate_type || "N/A", 50, y + 8, { width: 150 });
 doc.text(cert.certificate_number || "N/A", 210, y + 8, {
 width: 100,
 });
 doc.fillColor(statusColor).text(statusText, 320, y + 8, {
 width: 80,
 });
 doc.fillColor("#2C3E50").text(
 cert.expiry_date
 ? new Date(cert.expiry_date).toLocaleDateString("en-IN")
 : "N/A",
 410,
 y + 8,
 { width: 130 }
 );
 y += rowHeight;
 if (y > doc.page.height - 100) {
 doc.addPage();
 y = 40;
 }
 });
 doc.y = y + 10;
 }
 // Footer
 doc.moveDown(2);
 doc
 .fontSize(8)
 .fillColor("#95A5A6")
 .text(`Generated on ${new Date().toLocaleString("en-IN")}`, {
 align: "center",
 });
 doc.end();
 console.log("Safety Report generated successfully");
} catch (err) {
 console.error("Error generating safety report:", err);
 res
 .status(500)
 .json({ error: "Error generating safety report: " + err.message });
}
};
// ======================================================
// CHECK SAFETY DATA
// ======================================================
exports.checkSafetyData = async (req, res) => {
const { unit } = req.query;
 try {
 const hasData = await pool.query(
 `SELECT
 (SELECT COUNT(*) FROM fire_safety WHERE unit_id=$1) +
 (SELECT COUNT(*) FROM physical_safety WHERE unit_id=$1) +
 (SELECT COUNT(*) FROM medical_readiness WHERE unit_id=$1) +
 (SELECT COUNT(*) FROM surveillance WHERE unit_id=$1) +
 (SELECT COUNT(*) FROM emergency_response WHERE unit_id=$1) +
 (SELECT COUNT(*) FROM compliance_certificates WHERE unit_id=$1)
 AS total_records`,
 [unit]
 );

 res.json({ has_data: parseInt(hasData.rows[0].total_records) > 0 });
} catch (err) {
 res.status(500).json({ error: "Error checking safety data" });
}
};