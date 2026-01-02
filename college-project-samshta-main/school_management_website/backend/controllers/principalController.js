


const pool = require('../config/db');

// Get principal profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM principal WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Principal profile not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get top N students per standard for the principal's unit
// Query parameter: ?limit=3  (default 3)
exports.getToppers = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 3;

    // Get principal's unit_id
    const principalResult = await pool.query('SELECT unit_id FROM principal WHERE user_id = $1', [userId]);
    if (principalResult.rows.length === 0) return res.status(404).json({ error: "No principal/unit assigned" });
    const unitId = principalResult.rows[0].unit_id;

    // Partition by standard and pick top N by percentage (highest first).
    // We assume `enrollments.percentage` exists; if your schema uses marks instead, adjust the column.
    const q = `
      SELECT student_id, full_name, standard, division, academic_year, percentage, rn
      FROM (
        SELECT s.student_id, s.full_name, e.standard, e.division, e.academic_year, e.percentage,
               ROW_NUMBER() OVER (PARTITION BY e.standard ORDER BY e.percentage DESC NULLS LAST) AS rn
          FROM students s
          JOIN enrollments e ON e.student_id = s.student_id
         WHERE s.unit_id = $1
      ) t
      WHERE rn <= $2
      ORDER BY standard, rn;
    `;
    const result = await pool.query(q, [unitId, limit]);

    // Group by standard for a friendly response shape
    const grouped = {};
    for (const r of result.rows) {
      const std = r.standard || 'Unknown';
      if (!grouped[std]) grouped[std] = [];
      grouped[std].push({
        student_id: r.student_id,
        full_name: r.full_name,
        division: r.division,
        academic_year: r.academic_year,
        percentage: r.percentage,
        rank: r.rn
      });
    }

    // Convert to array sorted by standard
    const response = Object.keys(grouped).sort((a,b) => {
      // try numeric sort if possible
      const na = Number(a), nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    }).map(std => ({ standard: std, toppers: grouped[std] }));

    res.json({ limit, data: response });
  } catch (err) {
    console.error("getToppers error:", err);
    res.status(500).json({ error: "Failed to fetch toppers" });
  }
};
// Onboard new principal
exports.onboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      phone,
      email,
      qualification,
      unit_id,
      joining_date,
      tenure_start_date,
      tenure_end_date,
      status
    } = req.body;

    console.log("Received data:", req.body); // Debug log

    // Insert new principal profile
    const result = await pool.query(
      `INSERT INTO principal (
        user_id,
        unit_id,
        full_name,
        phone,
        email,
        qualification,
        joining_date,
        tenure_start_date,
        tenure_end_date,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        userId,          // $1
        unit_id,         // $2
        full_name,       // $3
        phone,           // $4
        email,           // $5
        qualification,   // $6
        joining_date || new Date(), // $7
        tenure_start_date,           // $8
        tenure_end_date,             // $9
        status || 'active'           // $10
      ]
    );

    console.log("Insert result:", result.rows[0]); // Debug log

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

// Update principal profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      phone,
      email,
      qualification,
      joining_date,
      tenure_start_date,
      tenure_end_date,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE principal 
       SET full_name = $1, 
           phone = $2, 
           email = $3, 
           qualification = $4,
           joining_date = $5, 
           tenure_start_date = $6, 
           tenure_end_date = $7,
           status = $8, 
           updatedAt = CURRENT_TIMESTAMP
       WHERE user_id = $9
       RETURNING *`,
      [full_name, phone, email, qualification, joining_date,
       tenure_start_date, tenure_end_date, status, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Principal profile not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in updateProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all teachers (remains the same but uses principal table for unit_id lookup)
exports.getTeachers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get principal's unit_id from principal table
    const principalResult = await pool.query(
      'SELECT unit_id FROM principal WHERE user_id = $1',
      [userId]
    );

    if (principalResult.rows.length === 0) {
      return res.status(404).json({ message: 'Principal profile not found' });
    }

    const unitId = principalResult.rows[0].unit_id;

    // Get all teachers in the unit
    const teachersResult = await pool.query(
      `SELECT * FROM staff 
       WHERE unit_id = $1 AND staff_type = 'teaching'
       ORDER BY full_name`,
      [unitId]
    );

    res.json(teachersResult.rows);
  } catch (err) {
    console.error('Error in getTeachers:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all students (remains the same but uses principal table for unit_id lookup)
// Get all students (new: uses join for enrollments)
exports.getStudents = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get principal's unit_id from principal table
    const principalResult = await pool.query(
      'SELECT unit_id FROM principal WHERE user_id = $1',
      [userId]
    );
    if (principalResult.rows.length === 0) {
      return res.status(404).json({ message: 'Principal profile not found' });
    }
    const unitId = principalResult.rows[0].unit_id;
    // JOIN students/enrollments so you get all info for table/charts
    const studentsResult = await pool.query(`
      SELECT s.student_id, s.full_name, s.dob, s.gender, s.address, s.parent_name, s.parent_phone, s.admission_date,
             s.unit_id, e.enrollment_id, e.standard, e.division, e.roll_number, e.academic_year, e.passed
      FROM students s
      JOIN enrollments e ON s.student_id = e.student_id
      WHERE s.unit_id = $1
      ORDER BY e.academic_year DESC, e.roll_number
    `, [unitId]);
    res.json(studentsResult.rows);
  } catch (err) {
    console.error('Error in getStudents:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getAnalytics = async (req, res) => {
  const { unit_id } = req.query;
  try {
    // Admissions per year
    const admissionsRes = await pool.query(`
      SELECT EXTRACT(YEAR FROM admission_date) AS year, COUNT(*) AS count
      FROM students WHERE unit_id = $1 GROUP BY year ORDER BY year
    `, [unit_id]);

    // Students by standard
    const classRes = await pool.query(`
      SELECT standard, COUNT(*) AS count
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      WHERE s.unit_id = $1
      GROUP BY standard ORDER BY standard
    `, [unit_id]);

    // Payments categories per fiscal year
    const paymentsRes = await pool.query(`
      SELECT fiscal_year, category, SUM(amount) AS total
      FROM unit_payments
      WHERE unit_id = $1
      GROUP BY fiscal_year, category
      ORDER BY fiscal_year, category
    `, [unit_id]);

    // Budgets per year/version
    const budgetsRes = await pool.query(`
      SELECT * FROM unit_budgets WHERE unit_id = $1 ORDER BY fiscal_year
    `, [unit_id]);

    // All students (for gender/pass charts)
    const studentsRes = await pool.query(`
      SELECT s.student_id, s.full_name, s.gender, s.admission_date,
             e.standard, e.academic_year, e.passed
      FROM students s
      JOIN enrollments e ON s.student_id = e.student_id
      WHERE s.unit_id = $1
    `, [unit_id]);

    res.json({
      admissions: admissionsRes.rows,
      studentsByClass: classRes.rows,
      payments: paymentsRes.rows,
      budgets: budgetsRes.rows,
      allStudents: studentsRes.rows   // THIS FIELD IS CRUCIAL FOR YOUR CHARTS
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to load analytics." });
  }
};



// New handler: Get Data for principal dashboard with profile, unit info, and counts
function getCurrentAcademicYear() {
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth(); // 0 = Jan
if (month >= 3) {
return `${year}-${(year + 1).toString().slice(-2)}`;
} else {
return `${year - 1}-${year.toString().slice(-2)}`;
}
}

// simple fiscal year like "2025-26"
function getCurrentFiscalYear() {
return getCurrentAcademicYear();
}

exports.getDashboardData = async (req, res) => {
try {
const userId = req.user.id;
const currentAy = getCurrentAcademicYear();
const currentFy = getCurrentFiscalYear();

// 1) Principal profile
const principalRes = await pool.query(
  "SELECT * FROM principal WHERE user_id = $1",
  [userId]
);
if (principalRes.rows.length === 0) {
  return res.status(404).json({ message: "Principal profile not found" });
}
const principal = principalRes.rows[0];
const unitId = principal.unit_id;

// 2) Unit info
const unitRes = await pool.query(
  `SELECT 
     unit_id, semis_no, dcf_no, nmms_no, scholarship_code,
     first_grant_in_aid_year, type_of_management, school_jurisdiction,
     competent_authority_name, authority_number, authority_zone,
     kendrashala_name, info_authority_name, appellate_authority_name,
     midday_meal_org_name, midday_meal_org_contact, standard_range,
     headmistress_name, headmistress_phone, headmistress_email, school_shift
   FROM unit
   WHERE unit_id = $1`,
  [unitId]
);
const unit = unitRes.rows || null;

// 3) Teacher count
const teacherCountRes = await pool.query(
  "SELECT COUNT(*) FROM staff WHERE unit_id = $1 AND staff_type = $2",
  [unitId, "teaching"]
);
const teacherCount = parseInt(teacherCountRes.rows[0].count, 10);

// 4) Student count
const studentCountRes = await pool.query(
  "SELECT COUNT(*) FROM students WHERE unit_id = $1",
  [unitId]
);
const studentCount = parseInt(studentCountRes.rows[0].count, 10);

// 5) Fees metrics

// Expected fees for this academic year = sum of fee_amount from fee_master
const expectedFeesRes = await pool.query(
  `SELECT COALESCE(SUM(fee_amount), 0) AS total
   FROM fee_master
   WHERE unit_id = $1 AND academic_year = $2`,
  [unitId, currentAy]
);
const expectedFees = Number(expectedFeesRes.rows[0].total) || 0;

// Collected fees for this academic year = sum of paid_amount from student_fees
const collectedFeesRes = await pool.query(
  `SELECT COALESCE(SUM(paid_amount), 0) AS total
   FROM student_fees
   WHERE unit_id = $1 AND academic_year = $2`,
  [unitId, currentAy]
);
const totalFeesCollected = Number(collectedFeesRes.rows[0].total) || 0;

const totalFeesPending = Math.max(expectedFees - totalFeesCollected, 0);

// 6) Salary metrics from salary_payments
const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();
// salary paid this month
const salaryMonthRes = await pool.query(
  `SELECT COALESCE(SUM(amount), 0) AS total
   FROM salary_payments
   WHERE unit_id = $1 AND year = $2 AND month = $3`,
  [unitId, currentYear, currentMonth]
);
const totalSalaryPaidThisMonth =
  Number(salaryMonthRes.rows[0].total) || 0;

// total salary paid in current academic year
const salaryAyRes = await pool.query(
  `SELECT COALESCE(SUM(amount), 0) AS total
   FROM salary_payments
   WHERE unit_id = $1 AND year = $2`,
  [unitId, currentYear] // simple: assume AY mostly in same calendar year
);
const totalSalaryPaidThisYear =
  Number(salaryAyRes.rows[0].total) || 0;

// 7) Calculate finance metrics from collected/expected data
// total_budget = expected fees from fee_master
// total_spent = salary paid this year (actual expense)
const totalBudget = expectedFees;
const totalSpent = totalSalaryPaidThisYear;
const balance = totalFeesCollected - totalSpent;

res.json({
  principal,
  unit,
  teacherCount,
  studentCount,
  finance: {
    academicYear: currentAy,
    total_budget: totalBudget,
    total_spent: totalSpent,
    balance: balance,
    expectedFees,
    totalFeesCollected,
    totalFeesPending,
    totalSalaryPaidThisMonth,
    totalSalaryPaidThisYear
  }
});
} catch (err) {
console.error("Error fetching dashboard data:", err);
res.status(500).json({ message: "Server error" });
}
};

// helper: convert FY string "2024-25" to start/end dates if needed later
function getFyDateRange(financialYear) {
  // financialYear example: "2024-25"
  const startYear = parseInt(financialYear.split("-")[0], 10);
  const start = new Date(startYear, 3, 1);   // 1 April
  const end = new Date(startYear + 1, 2, 31, 23, 59, 59); // 31 March next year
  return { start, end };
}

// Fees collected and salary spent in a given financial year
exports.getFinanceByYear = async (req, res) => {
  try {
    const userId = req.user.id;
    const { financial_year } = req.query; // e.g. "2024-25"

    if (!financial_year) {
      return res
        .status(400)
        .json({ message: "financial_year query param is required" });
    }

    // principal -> unit_id
    const principalRes = await pool.query(
      "SELECT * FROM principal WHERE user_id = $1",
      [userId]
    );
    if (principalRes.rows.length === 0) {
      return res.status(404).json({ message: "Principal profile not found" });
    }
    const principal = principalRes.rows[0];
    const unitId = principal.unit_id;

    // 1) Total fees collected in this financial year
    // assuming academic_year in student_fees uses same format as financial_year ("2024-25")
    const feesRes = await pool.query(
      `SELECT COALESCE(SUM(paid_amount), 0) AS total
       FROM student_fees
       WHERE unit_id = $1 AND academic_year = $2`,
      [unitId, financial_year]
    );
    const feesCollectedFy = Number(feesRes.rows[0].total) || 0;

    // 2) Total salary spent in this financial year
    // salary_payments has "year" and "month" integers
    const startYear = parseInt(financial_year.split("-")[0], 10);
    const endYear = startYear + 1;

    const salaryRes = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM salary_payments
       WHERE unit_id = $1
         AND (
               (year = $2 AND month >= 4)      -- Apr..Dec of startYear
            OR (year = $3 AND month <= 3)      -- Jan..Mar of endYear
         )`,
      [unitId, startYear, endYear]
    );
    const salarySpentFy = Number(salaryRes.rows[0].total) || 0;

    return res.json({
      unitId,
      financial_year,
      feesCollectedFy,
      salarySpentFy
    });
  } catch (err) {
    console.error("Error in getFinanceByYear:", err);
    res.status(500).json({ message: "Server error" });
  }
};