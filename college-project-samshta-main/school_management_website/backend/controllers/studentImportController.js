

// controllers/studentImportController.js
const XLSX = require("xlsx");
const fs = require("fs");
const pool = require("../config/db"); // your existing pg Pool

const parseBoolean = (value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return value;
  const v = String(value).trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return null;
};

exports.importStudents = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = req.file.path;

  let client;
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    // Optional header validation (simple)
    const requiredHeaders = [
      "unit_id",
      "full_name",
      "dob",
      "gender",
      "academic_year",
      "standard"
    ];
    const rowKeys = Object.keys(rows[0] || {});
    const missingHeaders = requiredHeaders.filter(
      (h) => !rowKeys.includes(h)
    );
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        message: "Excel headers are invalid.",
        missingHeaders
      });
    }

    console.log("First row raw from Excel:", rows[0]);

    client = await pool.connect();
    await client.query("BEGIN");

    let importedCount = 0;
    const now = new Date();

    for (const row of rows) {
      console.log("Row from Excel:", row);

      const {
        unit_id,
        full_name,
        dob,
        gender,
        address,
        parent_name,
        parent_phone,
        admission_date,
        academic_year,
        standard,
        division,
        roll_number,
        passed,
        percentage,
        // NEW fee-related columns in Excel
        fee_paid_amount,
        fee_paid_on,
        fee_clerk_id,
        fee_remarks
      } = row;

      console.log("Parsed values:", {
        unit_id,
        full_name,
        dob,
        gender,
        academic_year,
        standard
      });

      // basic required-field validation for student+enrollment
      if (
        !unit_id ||
        !full_name ||
        !dob ||
        !gender ||
        !academic_year ||
        !standard
      ) {
        // skip invalid row
        continue;
      }

      // ---- Insert into students ----
      const studentResult = await client.query(
        `INSERT INTO students
         (unit_id, full_name, dob, gender, address, parent_name, parent_phone, createdat, updatedat, admission_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING student_id`,
        [
          Number(unit_id),
          String(full_name).trim(),
          new Date(dob),
          String(gender).trim(),
          address ? String(address).trim() : null,
          parent_name ? String(parent_name).trim() : null,
          parent_phone ? String(parent_phone).trim() : null,
          now,
          now,
          admission_date ? new Date(admission_date) : null
        ]
      );

      const studentId = studentResult.rows[0].student_id;

      // ---- Insert into enrollments ----
      await client.query(
        `INSERT INTO enrollments
         (student_id, academic_year, standard, division, roll_number, createdat, updatedat, passed, percentage)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          studentId,
          String(academic_year).trim(),
          String(standard).trim(),
          division ? String(division).trim() : null,
          roll_number ? String(roll_number).trim() : null,
          now,
          now,
          parseBoolean(passed),
          percentage !== "" && percentage !== null
            ? Number(percentage)
            : null
        ]
      );

      // ---- Insert into student_fees (optional per row) ----
      const hasFeeInfo =
        fee_paid_amount !== "" ||
        fee_paid_on !== "" ||
        fee_clerk_id !== "" ||
        fee_remarks !== "";

      if (hasFeeInfo) {
        await client.query(
          `INSERT INTO student_fees
           (student_id, unit_id, academic_year, paid_amount, paid_on, clerk_id, remarks)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            studentId,
            Number(unit_id),
            String(academic_year).trim(),
            fee_paid_amount !== "" && fee_paid_amount !== null
              ? Number(fee_paid_amount)
              : null,
            fee_paid_on ? new Date(fee_paid_on) : null,

            // SAFE conversion for clerk_id
            fee_clerk_id !== "" && fee_clerk_id !== null && !isNaN(Number(fee_clerk_id))
              ? Number(fee_clerk_id)
              : null,

            // SAFE conversion for remarks (ensure it's always string)
            fee_remarks !== "" && fee_remarks !== null
              ? String(fee_remarks).trim()
              : null
          ]
        );
      }

      importedCount += 1;
    }

    await client.query("COMMIT");

    res.json({
      message: "Students imported successfully",
      importedCount
    });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error(err);
    res
      .status(500)
      .json({ message: "Error importing students", error: err.message });
  } finally {
    if (client) client.release();
    fs.unlink(filePath, () => {});
  }
};
