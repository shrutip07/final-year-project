const pool = require('../config/db');

// Get clerk profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM clerks WHERE user_id = $1`,
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Clerk profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { full_name, email, phone, qualification, joining_date, retirement_date, address, gender, status } = req.body;
    const result = await pool.query(
      `UPDATE clerks SET full_name=$1, email=$2, phone=$3, qualification=$4, joining_date=$5, retirement_date=$6, address=$7, gender=$8, status=$9, updated_at=NOW()
       WHERE user_id=$10 RETURNING *`,
      [full_name, email, phone, qualification, joining_date, retirement_date, address, gender, status, user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "No profile" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};
exports.getUnitDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the clerk's assigned unit
    const clerkRes = await pool.query("SELECT unit_id FROM clerks WHERE user_id = $1", [userId]);
    if (clerkRes.rows.length === 0) return res.status(404).json({ error: "Unit not found." });

    const unit_id = clerkRes.rows[0].unit_id;

    // Fetch all columns for this unit
    const unitRes = await pool.query("SELECT * FROM unit WHERE unit_id = $1", [unit_id]);
    if (unitRes.rows.length === 0) return res.status(404).json({ error: "Unit not found." });

    const unit = unitRes.rows[0];

    // Count teachers in this unit
    const teacherRes = await pool.query(
      "SELECT COUNT(*) as teacher_count FROM staff WHERE unit_id = $1 AND staff_type = 'teaching'",
      [unit_id]
    );

    // Count students in this unit
    const studentRes = await pool.query(
      "SELECT COUNT(*) as student_count FROM students WHERE unit_id = $1",
      [unit_id]
    );

    res.json({
      unit, // all columns from unit table
      teacherCount: parseInt(teacherRes.rows[0].teacher_count, 10),
      studentCount: parseInt(studentRes.rows[0].student_count, 10)
    });
  } catch (err) {
    console.error("Unit dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard info" });
  }
};

exports.onboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      phone,
      email,
      qualification,
      joining_date,
      retirement_date,
      status,
      address,
      gender,
      unit_id    // <-- Add unit_id from req.body!
    } = req.body;

    // Insert or update clerk profile including unit_id
    const result = await pool.query(
      `INSERT INTO clerks (
        user_id,
        full_name,
        phone,
        email,
        qualification,
        joining_date,
        retirement_date,
        status,
        address,
        gender,
        unit_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id) DO UPDATE SET
        full_name = $2,
        phone = $3,
        email = $4,
        qualification = $5,
        joining_date = $6,
        retirement_date = $7,
        status = $8,
        address = $9,
        gender = $10,
        unit_id = $11
      RETURNING *`,
      [
        userId,
        full_name,
        phone,
        email,
        qualification,
        joining_date,
        retirement_date,
        status || 'active',
        address,
        gender,
        unit_id    // <-- Pass in the value here!
      ]
    );
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Onboarding error details:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Optionally, implement updateProfile etc in a similar way.
// Get all fee settings for this unit
exports.getFeeMaster = async (req, res) => {
  try {
    const userId = req.user.id;
    // Fetch unit_id from clerks table
    const { rows } = await pool.query("SELECT unit_id FROM clerks WHERE user_id = $1", [userId]);
    const unit_id = rows[0]?.unit_id;
    if (!unit_id) return res.status(404).json({ error: "No unit assigned." });

    const fees = await pool.query(
      "SELECT id, standard, academic_year, fee_amount FROM fee_master WHERE unit_id = $1 ORDER BY academic_year DESC, standard",
      [unit_id]
    );
    res.json({ unit_id, fees: fees.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fee master." });
  }
};

// Add or update a fee amount
exports.setFeeMaster = async (req, res) => {
  try {
    const userId = req.user.id;
    const { standard, academic_year, fee_amount } = req.body;
    // Get the clerk's unit_id
    if (!standard || !academic_year || !fee_amount) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const { rows } = await pool.query("SELECT unit_id FROM clerks WHERE user_id = $1", [userId]);
    const unit_id = rows[0]?.unit_id;
    if (!unit_id) return res.status(404).json({ error: "No unit assigned." });

    // Upsert by standard + year + unit
    const result = await pool.query(
      `INSERT INTO fee_master (unit_id, standard, academic_year, fee_amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (unit_id, standard, academic_year)
       DO UPDATE SET fee_amount = $4
       RETURNING *`,
      [unit_id, standard, academic_year, fee_amount]
    );
    res.json({ fee: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update fee master." });
  }
};

// Get students by standard, division, and unit for a particular year
exports.listStudentsForFee = async (req, res) => {
  try {
    const userId = req.user.id;
    const { standard, division, academic_year } = req.query;
    
    // Get clerk's unit_id
    const { rows } = await pool.query("SELECT unit_id FROM clerks WHERE user_id = $1", [userId]);
    const unit_id = rows[0]?.unit_id;
    if (!unit_id) return res.status(404).json({ error: "No unit assigned." });

    // Join enrollments with students: filter on students.unit_id!
    const studentsRes = await pool.query(
      `SELECT e.student_id, s.full_name, e.standard, e.division, e.academic_year,
              COALESCE(sf.paid_amount, 0) AS paid_amount,
              sf.paid_on,
              sf.remarks,
              sf.fee_id IS NOT NULL AS paid_status
       FROM enrollments e
       JOIN students s ON s.student_id = e.student_id
       LEFT JOIN student_fees sf
         ON sf.student_id = e.student_id
        AND sf.unit_id = s.unit_id
        AND sf.academic_year = e.academic_year
       WHERE s.unit_id = $1
         AND e.standard = $2
         AND e.division = $3
         AND e.academic_year = $4
       ORDER BY s.full_name ASC`,
      [unit_id, standard, division, academic_year]
    );

    res.json(studentsRes.rows);
  } catch (err) {
    console.error('listStudentsForFee error:', err);
    res.status(500).json({ error: err.message || "Failed to fetch students." });
  }
};


exports.updateStudentFeeStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { student_id, academic_year, paid_amount, paid_on, remarks } = req.body;

    // Defensive type checks
    if (!student_id || !academic_year || !paid_amount || !paid_on) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Get student's unit_id (NOT clerk's!)
    const studentRes = await pool.query(
      "SELECT unit_id FROM students WHERE student_id = $1",
      [student_id]
    );
    const unit_id = studentRes.rows[0]?.unit_id;
    if (!unit_id) return res.status(404).json({ error: "Student/unit not found." });

    // Get clerk_id
    const clerkRes = await pool.query(
      "SELECT clerk_id FROM clerks WHERE user_id = $1",
      [userId]
    );
    const clerk_id = clerkRes.rows[0]?.clerk_id;
    if (!clerk_id) return res.status(404).json({ error: "Clerk not found." });

    // LOG INPUTS (for debugging, remove in production)
    console.log({
      student_id,
      unit_id,
      academic_year,
      paid_amount,
      paid_on,
      clerk_id,
      remarks
    });

    // Upsert fee payment entry
    const result = await pool.query(
      `INSERT INTO student_fees
        (student_id, unit_id, academic_year, paid_amount, paid_on, clerk_id, remarks)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (student_id, unit_id, academic_year)
      DO UPDATE SET
        paid_amount = $4, paid_on = $5, clerk_id = $6, remarks = $7
      RETURNING *`,
      [
        Number(student_id),
        Number(unit_id),
        academic_year,
        Number(paid_amount),
        paid_on, // assuming from frontend is 'YYYY-MM-DD'
        Number(clerk_id),
        remarks || null
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("updateStudentFeeStatus error:", err);
    res.status(500).json({ error: err.message || "Failed to update payment status." });
  }
};

// Set or update salary for a teacher in salary_history (with audit/history)
// Assigns/updates teacher salary in salary_history (no unit_id in req.body)
exports.setTeacherSalary = async (req, res) => {
  try {
    const { staff_id, amount, effective_from, remarks } = req.body;
    // Get clerk's unit_id using JWT
    const userId = req.user.id;
    const { rows: clerkRows } = await pool.query(
      "SELECT unit_id FROM clerks WHERE user_id = $1",
      [userId]
    );
    const unit_id = clerkRows[0]?.unit_id;
    if (!staff_id || !amount || !unit_id) {
      return res.status(400).json({ error: "staff_id, amount, and valid clerk/unit required" });
    }
    const effFrom = effective_from || new Date().toISOString().slice(0,10);

    // 1. End current salary for this teacher at this unit (if any)
    await pool.query(
      `UPDATE salary_history
       SET effective_to = $1::date - INTERVAL '1 day'
       WHERE staff_id = $2 AND unit_id = $3 AND effective_to IS NULL`,
      [effFrom, staff_id, unit_id]
    );

    // 2. Insert new salary row marked as current
    const result = await pool.query(
      `INSERT INTO salary_history
         (staff_id, unit_id, amount, effective_from, effective_to, remarks)
         VALUES ($1, $2, $3, $4, NULL, $5)
         RETURNING *`,
      [staff_id, unit_id, amount, effFrom, remarks || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Salary update failed: " + err.message });
  }
};

// Get current salary for all teachers in clerk's unit
exports.getAllTeacherSalaries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows: clerkRows } = await pool.query(
      "SELECT unit_id FROM clerks WHERE user_id = $1",
      [userId]
    );
    const unit_id = clerkRows[0]?.unit_id;
    if (!unit_id) return res.status(404).json({ error: "No unit assigned to clerk" });

    const { rows } = await pool.query(
      `SELECT s.staff_id, s.full_name, sh.amount, sh.remarks, sh.effective_from
         FROM staff s
         LEFT JOIN salary_history sh
           ON sh.staff_id = s.staff_id AND sh.unit_id = $1 AND sh.effective_to IS NULL
         WHERE s.unit_id = $1 AND s.staff_type = 'teaching'
         ORDER BY s.full_name ASC`,
      [unit_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch salaries failed: " + err.message });
  }
};

// GET: Fetch record for clerk's unit
exports.getPhysicalSafetyInfo = async (req, res) => {
  const userId = req.user.id;
  const { rows: unitRows } = await pool.query('SELECT unit_id FROM clerks WHERE user_id = $1', [userId]);
  const unit_id = unitRows[0]?.unit_id;
  if (!unit_id) return res.status(404).json({ error: "No unit assigned" });

  const { rows } = await pool.query('SELECT * FROM physical_safety WHERE unit_id = $1', [unit_id]);
  res.json(rows[0] || {});
};

// PUT: Update or insert record for clerk's unit
exports.updatePhysicalSafetyInfo = async (req, res) => {
  const userId = req.user.id;
  const { rows: unitRows } = await pool.query('SELECT unit_id FROM clerks WHERE user_id = $1', [userId]);
  const unit_id = unitRows[0]?.unit_id;
  if (!unit_id) return res.status(404).json({ error: "No unit assigned" });

  // All fields destructured from req.body (adapt to your form)
  const {
    building_compliance_certificate, building_compliance_date,
    stairs_count, stairs_condition, ramps_count, ramps_condition,
    handrails_count, handrails_condition, playground_status,
    drinking_water_outlets, last_water_quality_test,
    toilets_boys, toilets_girls, last_sanitation_check,
    lighting_status, ventilation_status,
    hazardous_storage_details, hazardous_last_checked
  } = req.body;

  const { rows } = await pool.query(`
    INSERT INTO physical_safety (
      unit_id, building_compliance_certificate, building_compliance_date,
      stairs_count, stairs_condition, ramps_count, ramps_condition,
      handrails_count, handrails_condition, playground_status,
      drinking_water_outlets, last_water_quality_test,
      toilets_boys, toilets_girls, last_sanitation_check,
      lighting_status, ventilation_status,
      hazardous_storage_details, hazardous_last_checked, updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP
    )
    ON CONFLICT (unit_id) DO UPDATE SET
      building_compliance_certificate = $2,
      building_compliance_date = $3,
      stairs_count = $4,
      stairs_condition = $5,
      ramps_count = $6,
      ramps_condition = $7,
      handrails_count = $8,
      handrails_condition = $9,
      playground_status = $10,
      drinking_water_outlets = $11,
      last_water_quality_test = $12,
      toilets_boys = $13,
      toilets_girls = $14,
      last_sanitation_check = $15,
      lighting_status = $16,
      ventilation_status = $17,
      hazardous_storage_details = $18,
      hazardous_last_checked = $19,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *`,
    [
      unit_id, building_compliance_certificate, building_compliance_date,
      stairs_count, stairs_condition, ramps_count, ramps_condition,
      handrails_count, handrails_condition, playground_status,
      drinking_water_outlets, last_water_quality_test,
      toilets_boys, toilets_girls, last_sanitation_check,
      lighting_status, ventilation_status,
      hazardous_storage_details, hazardous_last_checked
    ]
  );
  res.json(rows[0]);
};
exports.getPhysicalSafetyAnalytics = async (req, res) => {
  const userId = req.user.id;
  const { rows: unitRows } = await pool.query('SELECT unit_id FROM clerks WHERE user_id = $1', [userId]);
  const unit_id = unitRows[0]?.unit_id;
  if (!unit_id) return res.status(404).json({ error: "No unit assigned" });

  // Get physical safety record
  const { rows } = await pool.query('SELECT * FROM physical_safety WHERE unit_id = $1', [unit_id]);
  const data = rows[0];
  if (!data) return res.json({});

  res.json({
    stairs: data.stairs_count ?? 0,
    ramps: data.ramps_count ?? 0,
    handrails: data.handrails_count ?? 0,
    drinking_water_outlets: data.drinking_water_outlets ?? 0,
    toilets_boys: data.toilets_boys ?? 0,
    toilets_girls: data.toilets_girls ?? 0,
    last_water_quality_test: data.last_water_quality_test ?? null,
    last_sanitation_check: data.last_sanitation_check ?? null
  });
};

// Get full salary history for a teacher
exports.getTeacherSalaryHistory = async (req, res) => {
  try {
    const { staff_id } = req.query;
    if (!staff_id) return res.status(400).json({ error: "staff_id required" });
    const { rows } = await pool.query(
      `SELECT amount, effective_from, effective_to, remarks
         FROM salary_history WHERE staff_id = $1
         ORDER BY effective_from DESC`,
      [staff_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch history failed: " + err.message });
  }
};

// 1. List salary status grid for all teachers for a given year
exports.getTeacherSalaryGrid = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;
    const queryYear = parseInt(year, 10) || new Date().getFullYear();

    // Find the clerk's unit
    const { rows: clerkRows } = await pool.query("SELECT unit_id FROM clerks WHERE user_id = $1", [userId]);
    const unit_id = clerkRows[0]?.unit_id;
    if (!unit_id) return res.status(404).json({ error: "No unit assigned to clerk" });

    // Get all teaching staff for this unit
    const { rows: staffRows } = await pool.query(
      "SELECT staff_id, full_name FROM staff WHERE unit_id = $1 AND staff_type='teaching' ORDER BY full_name ASC",
      [unit_id]
    );

    // Get payment status for all teachers for this year (by month)
    const { rows: payments } = await pool.query(
      `SELECT staff_id, year, month, amount, paid_on, remarks
         FROM salary_payments
        WHERE unit_id=$1 AND year=$2`,
      [unit_id, queryYear]
    );

    // Make a hash for quick lookup
    const paymentsHash = {};
    for (const p of payments) {
      if (!paymentsHash[p.staff_id]) paymentsHash[p.staff_id] = {};
      paymentsHash[p.staff_id][p.month] = p;
    }

    // Build the grid: each staff gets 12 months row; otherwise pending if not paid
    const resultGrid = staffRows.map(staff => {
      const paymentsArr = [];
      for (let month = 1; month <= 12; ++month) {
        const status = paymentsHash[staff.staff_id]?.[month];
        paymentsArr.push({
          month,
          year: queryYear,
          amount: status?.amount || null,
          paid_on: status?.paid_on || null,
          remarks: status?.remarks || "",
        });
      }
      return { staff_id: staff.staff_id, full_name: staff.full_name, payments: paymentsArr };
    });

    res.json({ year: queryYear, staff: resultGrid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Mark a monthly salary as paid or update (pay salary for a month)
exports.payTeacherSalary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { staff_id, year, month, amount, paid_on, remarks } = req.body;
    if (!staff_id || !year || !month || !amount || !paid_on) 
      return res.status(400).json({ error: "staff_id, year, month,paid on and amount required" });

    // Clerk's unit_id and clerk_id for audit
    const { rows: clerkRows } = await pool.query("SELECT unit_id, clerk_id FROM clerks WHERE user_id = $1", [userId]);
    const unit_id = clerkRows[0]?.unit_id;
    const clerk_id = clerkRows[0]?.clerk_id;
    if (!unit_id || !clerk_id) return res.status(400).json({ error: "clerk/unit missing" });

    // UPSERT: Insert if new, else update existing
    const resp = await pool.query(
      `INSERT INTO salary_payments
         (staff_id, unit_id, year, month, amount, paid_on, clerk_id, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (staff_id, unit_id, year, month)
       DO UPDATE SET amount=$5, paid_on=$6, clerk_id=$7, remarks=$8
       RETURNING *`,
      [staff_id, unit_id, year, month, amount, paid_on || new Date().toISOString().slice(0,10), clerk_id, remarks || ""]
    );
    res.json(resp.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Report: List all pending salaries for a unit by year/month
exports.getPendingSalaries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;
    // Find clerk's unit
    const { rows: clerkRows } = await pool.query("SELECT unit_id FROM clerks WHERE user_id = $1", [userId]);
    const unit_id = clerkRows[0]?.unit_id;
    if (!unit_id) return res.status(404).json({ error: "No unit assigned to clerk" });

    // All teaching staff for this unit
    const { rows: staffRows } = await pool.query(
      "SELECT staff_id, full_name FROM staff WHERE unit_id = $1 AND staff_type='teaching'",
      [unit_id]
    );
    // Find for each staff if no payment row (pending)
    const yearNum = parseInt(year, 10) || new Date().getFullYear();
    const monthNum = month ? parseInt(month, 10) : null;

    // Query for pending months
    let q = `
      SELECT s.staff_id, s.full_name, p.year, p.month, p.amount, p.paid_on
        FROM staff s
    LEFT JOIN salary_payments p ON p.staff_id = s.staff_id AND p.unit_id = s.unit_id
                              AND p.year = $2
    WHERE s.unit_id = $1 AND s.staff_type='teaching' AND (p.paid_on IS NULL OR p.payment_id IS NULL)
    `;
    const qArgs = [unit_id, yearNum];
    if (monthNum) {
      q += " AND p.month = $3";
      qArgs.push(monthNum);
    }
    const { rows: pending } = await pool.query(q, qArgs);

    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
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
      roll_number
    } = req.body;

    // Basic validations
    if (!full_name || !dob || !gender || !academic_year || !standard) {
      return res.status(400).json({ error: "full_name, dob, gender, academic_year, standard are required." });
    }

    // Get clerk's unit_id
    const { rows: clerkRows } = await pool.query(
      "SELECT unit_id FROM clerks WHERE user_id = $1",
      [userId]
    );
    const unit_id = clerkRows[0]?.unit_id;
    if (!unit_id) {
      return res.status(404).json({ error: "No unit assigned to clerk." });
    }

    // 1) Insert into students
    const studentRes = await pool.query(
      `INSERT INTO students
        (unit_id, full_name, dob, gender, address, parent_name, parent_phone, admission_date, createdat, updatedat)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING student_id`,
      [
        unit_id,
        full_name,
        dob,
        gender,
        address || null,
        parent_name || null,
        parent_phone || null,
        admission_date || new Date().toISOString().slice(0, 10)
      ]
    );

    const student_id = studentRes.rows[0].student_id;

    // 2) Create first enrollment row for this student
    const enrollRes = await pool.query(
      `INSERT INTO enrollments
        (student_id, academic_year, standard, division, roll_number, passed, createdat, updatedat)
       VALUES
        ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        student_id,
        academic_year,
        standard,
        division || null,
        roll_number || null,
        null
      ]
    );

    res.status(201).json({
      success: true,
      student_id,
      enrollment: enrollRes.rows[0]
    });
  } catch (err) {
    console.error("addStudent error:", err);
    res.status(500).json({ error: "Failed to add student." });
  }
};
// List teachers + their current class assignments for a given academic year
exports.listTeachersForAllocation = async (req, res) => {
try {
const userId = req.user.id;
const { academic_year } = req.query;

if (!academic_year) {
  return res.status(400).json({ error: "academic_year is required" });
}
// Clerk's unit
const { rows: clerkRows } = await pool.query(
"SELECT unit_id FROM clerks WHERE user_id = $1",
[userId]
);
const unit_id = clerkRows[0]?.unit_id; // <-- FIX
if (!unit_id) {
return res.status(404).json({ error: "No unit assigned to clerk" });
}

// Teachers in this unit + their assignments for this year
const { rows } = await pool.query(
  `
  SELECT 
    st.staff_id,
    st.full_name,
    st.email,
    st.phone,
    st.subject,
    tca.id AS assignment_id,
    tca.academic_year,
    tca.standard,
    tca.division,
    COALESCE(tca.done_for_year, false) AS done_for_year
  FROM staff st
  LEFT JOIN teacher_class_assignments tca
    ON tca.staff_id = st.staff_id
   AND tca.academic_year = $2
  WHERE st.unit_id = $1
    AND st.staff_type = 'teaching'
  ORDER BY st.full_name ASC, tca.standard, tca.division
  `,
  [unit_id, academic_year]
);

res.json(rows);
} catch (err) {
console.error("listTeachersForAllocation error:", err);
res.status(500).json({ error: "Failed to load teachers." });
}
};
exports.allocateTeacherClass = async (req, res) => {
try {
const userId = req.user.id;
const { staff_id, academic_year, standard, division } = req.body;

if (!staff_id || !academic_year || !standard || !division) {
  return res
    .status(400)
    .json({ error: "staff_id, academic_year, standard, division are required." });
}

// Clerk's unit
const { rows: clerkRows } = await pool.query(
"SELECT unit_id FROM clerks WHERE user_id = $1",
[userId]
);
const unit_id = clerkRows[0]?.unit_id; // <-- FIX
if (!unit_id) {
return res.status(404).json({ error: "No unit assigned to clerk" });
}
const { rows: staffRows } = await pool.query(
  "SELECT unit_id FROM staff WHERE staff_id = $1 AND staff_type = 'teaching'",
  [staff_id]
);
if (!staffRows.length) {
  return res.status(404).json({ error: "Teacher not found" });
}
if (staffRows[0].unit_id !== unit_id) {
  return res.status(403).json({ error: "Teacher is not in this unit." });
}

const result = await pool.query(
  `
  INSERT INTO teacher_class_assignments
    (staff_id, academic_year, standard, division, done_for_year, createdat, updatedat)
  VALUES ($1,$2,$3,$4,false,NOW(),NOW())
  ON CONFLICT (staff_id, academic_year, standard, division)
  DO UPDATE SET updatedat = NOW(), done_for_year = FALSE
  RETURNING *
  `,
  [staff_id, academic_year, standard, division]
);

res.status(201).json(result.rows);
} catch (err) {
console.error("allocateTeacherClass error:", err);
res.status(500).json({ error: "Failed to allocate teacher." });
}
};
// List PASSed students in clerk's unit for a given academic year
exports.listPassedStudentsForAllocation = async (req, res) => {
try {
const userId = req.user.id;
const { academic_year } = req.query;

if (!academic_year) {
  return res.status(400).json({ error: "academic_year is required" });
}

// Clerk's unit
const { rows: clerkRows } = await pool.query(
"SELECT unit_id FROM clerks WHERE user_id = $1",
[userId]
);
const unit_id = clerkRows[0]?.unit_id; // <-- FIX
if (!unit_id) {
return res.status(404).json({ error: "No unit assigned to clerk" });
}
const { rows } = await pool.query(
  `
  SELECT
    s.student_id,
    s.full_name,
    s.gender,
    s.parent_name,
    s.parent_phone,
    e.enrollment_id,
    e.academic_year,
    e.standard,
    e.division,
    e.roll_number,
    e.passed
  FROM enrollments e
  JOIN students s ON s.student_id = e.student_id
  WHERE s.unit_id = $1
    AND e.academic_year = $2
    AND e.passed = TRUE
  ORDER BY e.standard, e.division, e.roll_number, s.full_name
  `,
  [unit_id, academic_year]
);

res.json(rows);
} catch (err) {
console.error("listPassedStudentsForAllocation error:", err);
res.status(500).json({ error: "Failed to load passed students." });
}
};


// Promote a single student to next standard+division for next academic year
exports.allocateStudentNextYear = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      student_id,
      from_academic_year,
      to_academic_year,
      standard,
      division,
      roll_number
    } = req.body;

    if (!student_id || !from_academic_year || !to_academic_year || !standard || !division) {
      return res.status(400).json({
        error:
          "student_id, from_academic_year, to_academic_year, standard, division are required."
      });
    }

    // Clerk's unit and student belongs to this unit
    const { rows: clerkRows } = await pool.query(
      "SELECT unit_id FROM clerks WHERE user_id = $1",
      [userId]
    );
    const unit_id = clerkRows[0]?.unit_id;
    if (!unit_id) return res.status(404).json({ error: "No unit assigned to clerk" });

    const { rows: studRows } = await pool.query(
      "SELECT unit_id FROM students WHERE student_id = $1",
      [student_id]
    );
    if (!studRows.length) return res.status(404).json({ error: "Student not found" });
    if (studRows[0].unit_id !== unit_id) {
      return res.status(403).json({ error: "Student not in this unit." });
    }

    // Ensure previous year enrollment exists and is passed
    const { rows: prevEnrollRows } = await pool.query(
      `
      SELECT enrollment_id, passed
      FROM enrollments
      WHERE student_id = $1 AND academic_year = $2
      `,
      [student_id, from_academic_year]
    );
    if (!prevEnrollRows.length) {
      return res
        .status(400)
        .json({ error: "Previous academic year enrollment not found for this student." });
    }
    if (!prevEnrollRows[0].passed) {
      return res.status(400).json({ error: "Student is not marked as passed for previous year." });
    }

    // Avoid duplicate enrollment for the target year
    const { rows: existingNext } = await pool.query(
      `
      SELECT enrollment_id
      FROM enrollments
      WHERE student_id = $1 AND academic_year = $2
      `,
      [student_id, to_academic_year]
    );
    if (existingNext.length) {
      return res
        .status(400)
        .json({ error: "Enrollment for target academic year already exists for this student." });
    }

    // Create new enrollment row for next year
    const { rows: newEnrollRows } = await pool.query(
      `
      INSERT INTO enrollments
        (student_id, academic_year, standard, division, roll_number, passed, createdat, updatedat)
      VALUES
        ($1, $2, $3, $4, $5, NULL, NOW(), NOW())
      RETURNING *
      `,
      [
        student_id,
        to_academic_year,
        standard,
        division,
        roll_number || null
      ]
    );

    res.status(201).json({
      success: true,
      enrollment: newEnrollRows[0]
    });
  } catch (err) {
    console.error("allocateStudentNextYear error:", err);
    res.status(500).json({ error: "Failed to allocate student for next year." });
  }
};
