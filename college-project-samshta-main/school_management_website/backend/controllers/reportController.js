const PDFDocument = require("pdfkit");
const pool = require("../config/db");
exports.getSchoolReport = async (req, res) => {
const { unitId } = req.params;
try {
 // 📌 1. Fetch school info
 const unit = await pool.query("SELECT * FROM unit WHERE unit_id = $1", [
 unitId
 ]);
 if (unit.rowCount === 0) {
 return res.status(404).json({ error: "Unit not found" });
 }
 const school = unit.rows[0];
 // 📌 2. Class summary
 const classSummary = await pool.query(
 `
 SELECT e.standard, e.division,
 COUNT(*) AS total,
 SUM(CASE WHEN s.gender='male' THEN 1 ELSE 0 END) AS boys,
 SUM(CASE WHEN s.gender='female' THEN 1 ELSE 0 END) AS girls,
 SUM(CASE WHEN e.passed=true THEN 1 ELSE 0 END) AS passed,
 SUM(CASE WHEN e.passed=false THEN 1 ELSE 0 END) AS failed,
 SUM(CASE WHEN s.admission_date >= DATE_TRUNC('year', CURRENT_DATE) THEN 1
ELSE 0 END)
 AS new_admissions,
 SUM(CASE WHEN e.roll_number IS NULL THEN 1 ELSE 0 END)
 AS left_students
 FROM enrollments e
 JOIN students s ON e.student_id = s.student_id
 WHERE s.unit_id = $1
 GROUP BY e.standard, e.division
 ORDER BY e.standard, e.division
 `,
 [unitId]
 );
 // 📌 3. Enrollment History
 const enrollmentHistory = await pool.query(
 `
 SELECT e.academic_year,
 COUNT(*) AS total
 FROM enrollments e
 JOIN students s ON s.student_id = e.student_id
 WHERE s.unit_id = $1
 GROUP BY e.academic_year
 ORDER BY e.academic_year
 `,
 [unitId]
 );
 // 📌 4. Teacher assignment
 const teachers = await pool.query(
 `
 SELECT DISTINCT e.standard, e.division,
 ''::text AS class_teacher
 FROM enrollments e
 JOIN students s ON s.student_id = e.student_id
 WHERE s.unit_id = $1
 ORDER BY e.standard, e.division
 `,
 [unitId]
 );
 // 📌 5. Admissions
 const admissions = await pool.query(
 `
 SELECT EXTRACT(YEAR FROM admission_date) AS year,
 COUNT(*) AS total
 FROM students
 WHERE unit_id = $1
 GROUP BY year
 ORDER BY year
 `,
 [unitId]
 );
 // ---------------------------------------------------
 // PDF START
 // ---------------------------------------------------
 const doc = new PDFDocument({ margin: 40 });
 res.setHeader("Content-Type", "application/pdf");
 res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", `attachment; filename=School_Report_Unit_${unitId}.pdf`);

 doc.pipe(res);
 // 📌 Helper: Section title
 const section = (title) => {
 doc.moveDown(1.5);
 doc.font("Helvetica-Bold").fontSize(14).text(title);
 doc.moveDown(0.5);
 };
 // 📌 Helper: Full width table with proper spacing
 const drawTable = (headers, rows) => {
 const tableWidth = doc.page.width - doc.options.margin * 2;
 const colWidth = tableWidth / headers.length;
 const startX = doc.options.margin;
 let y = doc.y;
 // Header
 doc.rect(startX, y, tableWidth, 20).fill("#444");
 doc.fillColor("white").font("Helvetica-Bold").fontSize(10);
 headers.forEach((h, i) => {
 doc.text(h, startX + i * colWidth + 4, y + 6, {
 width: colWidth,
 align: "left"
 });
 });
 y += 22;
 // Rows
 rows.forEach((row, idx) => {
 const isEven = idx % 2 === 0;
 if (isEven) {
 doc.rect(startX, y, tableWidth, 18).fill("#F2F2F2");
 } else {
 doc.rect(startX, y, tableWidth, 18).fill("white");
 }
 doc.fillColor("black").font("Helvetica").fontSize(10);
 headers.forEach((h, i) => {
 const key = h.toLowerCase().replace(/\s+/g, "_");
 const value = row[key] ?? "";
 doc.text(String(value), startX + i * colWidth + 4, y + 4, {
 width: colWidth,
 align: "left"
 });
 });
 y += 20;
 });
 // After table ends, reset positions
 doc.moveDown(2);
 doc.x = doc.options.margin;
 doc.y = y + 10;
 };
 // ---------------------------------------------------
 // HEADER
 // ---------------------------------------------------
 doc.font("Helvetica-Bold").fontSize(22).text("School Annual Report", {
 align: "center"
 });
 doc.moveDown();
 doc.font("Helvetica").fontSize(12);
 doc.text(`School Name: ${school.kendrashala_name}`);
 doc.text(`SEMIS No: ${school.semis_no || "NA"}`);
 doc.text(`Management: ${school.type_of_management}`);
 doc.text(`Jurisdiction: ${school.school_jurisdiction}`);
 // ---------------------------------------------------
 // TABLES
 // ---------------------------------------------------
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
 failed: r.failed
 }))
 );
 section("2. Academic Result Summary");
 drawTable(
 ["Std", "Div", "Passed", "Failed"],
 classSummary.rows.map((r) => ({
 std: r.standard,
 div: r.division,
 passed: r.passed,
 failed: r.failed
 }))
 );
 section("3. Teacher Assignment per Class");
 drawTable(
 ["Standard", "Division", "Class Teacher"],
 teachers.rows.map((r) => ({
 standard: r.standard,
 division: r.division,
 class_teacher: r.class_teacher
 }))
 );
 section("4. Enrollment History");
 drawTable(
 ["Year", "Total"],
 enrollmentHistory.rows.map((r) => ({
 year: r.academic_year,
 total: r.total
 }))
 );
 doc.addPage({ margin: 40 });
 section("5. Admission Summary");
 drawTable(
 ["Year", "Admissions"],
 admissions.rows.map((r) => ({
 year: r.year,
 admissions: r.total
 }))
 );
 doc.end();
} catch (error) {
 console.log(error);
 res.status(500).json({ error: "Failed to generate report" });
}
};
