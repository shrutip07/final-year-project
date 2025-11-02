// const pool = require('../config/db');

// // Get all units/schools for the dashboard
// exports.getUnits = async (req, res) => {
//   try {
//     console.log('Fetching units...'); // Debug log
//     const result = await pool.query('SELECT * FROM unit');
//     console.log('Units found:', result.rows.length); // Debug log
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error in getUnits:', err);
//     res.status(500).json({ error: err.message });
//   }
// };
// exports.getUnits = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM unit');
//     const units = result.rows;

//     // For each unit, fetch staff and student count
//     const enrichedUnits = await Promise.all(
//       units.map(async (unit) => {
//         const staffRes = await pool.query(
//           `SELECT COUNT(*) FROM staff WHERE unit_id=$1`,
//           [unit.unit_id]
//         );
//         const studentRes = await pool.query(
//           `SELECT COUNT(*) FROM students WHERE unit_id=$1`,
//           [unit.unit_id]
//         );
//         return {
//           ...unit,
//           staff_count: parseInt(staffRes.rows[0].count),
//           student_count: parseInt(studentRes.rows[0].count)
//         };
//       })
//     );

//     res.json(enrichedUnits);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// // Get single unit's full details by ID (add to adminController.js)
// exports.getUnitById = async (req, res) => {
//   try {
//     const { unitId } = req.params;
//     const unitResult = await pool.query('SELECT * FROM unit WHERE unit_id=$1', [unitId]);
//     if (unitResult.rowCount === 0) return res.status(404).json({ error: "Unit not found" });
//     const teachersResult = await pool.query(
//       `SELECT staff_id, full_name, email, phone, qualification, designation, subject, joining_date, updatedat
//        FROM staff WHERE unit_id = $1 AND staff_type = 'teaching'`, [unitId]);
//     // FIX IS HERE: JOIN enrollments for complete student info
//     const studentsResult = await pool.query(
//       `SELECT s.student_id, s.full_name, s.dob, s.gender, s.address, s.parent_name, s.parent_phone, s.admission_date,
//               e.standard, e.division, e.roll_number, e.academic_year, e.passed, s.createdat, s.updatedat
//          FROM students s
//          JOIN enrollments e ON s.student_id = e.student_id
//         WHERE s.unit_id = $1
//         ORDER BY e.academic_year DESC, e.roll_number`,
//       [unitId]
//     );
//     res.json({
//       ...unitResult.rows[0],
//       teachers: teachersResult.rows,
//       students: studentsResult.rows
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // Get all teaching staff for a unit
// exports.getUnitTeachers = async (req, res) => {
//   try {
//     const { unitId } = req.params;
//     console.log('Fetching teachers for unit:', unitId); // Debug log
    
//     const result = await pool.query(
//       `SELECT staff_id, full_name, email, phone, qualification, 
//               designation, subject, joining_date, updatedat
//        FROM staff 
//        WHERE unit_id = $1 AND staff_type = 'teaching'`,
//       [unitId]
//     );
//     console.log('Teachers found:', result.rows.length); // Debug log
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error in getUnitTeachers:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get all students for a unit
// exports.getUnitStudents = async (req, res) => {
//   try {
//     const { unitId } = req.params;
//     console.log('Fetching students for unit:', unitId); // Debug log
    
//    const result = await pool.query(
//   `SELECT s.student_id, s.full_name, s.dob, s.gender, s.address, s.parent_name, s.parent_phone, s.admission_date,
//           e.standard, e.division, e.roll_number, e.academic_year, e.passed, s.createdat, s.updatedat
//    FROM students s
//    JOIN enrollments e ON s.student_id = e.student_id
//    WHERE s.unit_id = $1
//    ORDER BY e.academic_year DESC, e.roll_number`,
//   [unitId]
// );

//     console.log('Students found:', result.rows.length); // Debug log
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error in getUnitStudents:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

const pool = require('../config/db');
exports.getUnitAnalytics = async (req, res) => {
  const { unitId } = req.params;
  try {
    // Admissions per year
    const admissionsRes = await pool.query(`
      SELECT EXTRACT(YEAR FROM admission_date) AS year, COUNT(*) AS count
      FROM students WHERE unit_id = $1 GROUP BY year ORDER BY year
    `, [unitId]);

    // Students by standard
    const classRes = await pool.query(`
      SELECT standard, COUNT(*) AS count
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      WHERE s.unit_id = $1
      GROUP BY standard ORDER BY standard
    `, [unitId]);

    // Payments categories per fiscal year
    const paymentsRes = await pool.query(`
      SELECT fiscal_year, category, SUM(amount) AS total
      FROM unit_payments
      WHERE unit_id = $1
      GROUP BY fiscal_year, category
      ORDER BY fiscal_year, category
    `, [unitId]);

    // Budgets per year/version
    const budgetsRes = await pool.query(`
      SELECT * FROM unit_budgets WHERE unit_id = $1 ORDER BY fiscal_year
    `, [unitId]);

    // All students (for gender/pass charts)
    const studentsRes = await pool.query(`
      SELECT s.student_id, s.full_name, s.gender, s.admission_date,
             e.standard, e.academic_year, e.passed
      FROM students s
      JOIN enrollments e ON s.student_id = e.student_id
      WHERE s.unit_id = $1
    `, [unitId]);

    res.json({
      admissions: admissionsRes.rows,
      studentsByClass: classRes.rows,
      payments: paymentsRes.rows,
      budgets: budgetsRes.rows,
      allStudents: studentsRes.rows
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to load analytics." });
  }
};
// Get all units/schools for the dashboard, including staff and student counts
exports.getUnits = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM unit');
    const units = result.rows;

    // For each unit, fetch staff and student count
    const enrichedUnits = await Promise.all(
      units.map(async (unit) => {
        const staffRes = await pool.query(
          `SELECT COUNT(*) FROM staff WHERE unit_id=$1`,
          [unit.unit_id]
        );
        const studentRes = await pool.query(
          `SELECT COUNT(*) FROM students WHERE unit_id=$1`,
          [unit.unit_id]
        );
        return {
          ...unit,
          staff_count: parseInt(staffRes.rows[0].count),
          student_count: parseInt(studentRes.rows[0].count)
        };
      })
    );

    res.json(enrichedUnits);
  } catch (err) {
    console.error('Error in getUnits:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get single unit's full details by ID (teachers + students with enrollments)
exports.getUnitById = async (req, res) => {
  try {
    const { unitId } = req.params;
    const unitResult = await pool.query('SELECT * FROM unit WHERE unit_id=$1', [unitId]);
    if (unitResult.rowCount === 0)
      return res.status(404).json({ error: "Unit not found" });

    const teachersResult = await pool.query(
      `SELECT staff_id, full_name, email, phone, qualification, designation, subject, joining_date, updatedat
       FROM staff WHERE unit_id = $1 AND staff_type = 'teaching'`, [unitId]);
const paymentsResult = await pool.query(
  'SELECT * FROM unit_payments WHERE unit_id = $1 ORDER BY fiscal_year, category', [unitId]
);
// Budgets per unit
const budgetsResult = await pool.query(
  'SELECT * FROM unit_budgets WHERE unit_id = $1 ORDER BY fiscal_year, version', [unitId]
);
// Banks per unit
const banksResult = await pool.query(
  'SELECT * FROM unit_banks WHERE unit_id = $1 ORDER BY bank_id', [unitId]
);
// Cases per unit
const casesResult = await pool.query(
  'SELECT * FROM unit_cases WHERE unit_id = $1 ORDER BY id', [unitId]
);
    // Students with enrollments (the critical change)
    const studentsResult = await pool.query(
      `SELECT s.student_id, s.full_name, s.dob, s.gender, s.address, s.parent_name, s.parent_phone, s.admission_date,
              e.standard, e.division, e.roll_number, e.academic_year, e.passed, s.createdat, s.updatedat
         FROM students s
         JOIN enrollments e ON s.student_id = e.student_id
        WHERE s.unit_id = $1
        ORDER BY e.academic_year DESC, e.roll_number`,
      [unitId]
    );

    res.json({
      ...unitResult.rows[0],
      teachers: teachersResult.rows,
      students: studentsResult.rows,
      payments: paymentsResult.rows,
  budgets: budgetsResult.rows,
  banks: banksResult.rows,
  cases: casesResult.rows
    });
  } catch (err) {
    console.error("Error in getUnitById:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all teaching staff for a unit
exports.getUnitTeachers = async (req, res) => {
  try {
    const { unitId } = req.params;
    const result = await pool.query(
      `SELECT staff_id, full_name, email, phone, qualification, 
              designation, subject, joining_date, updatedat
       FROM staff 
       WHERE unit_id = $1 AND staff_type = 'teaching'`,
      [unitId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getUnitTeachers:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all students for a unit (with enrollments info)
exports.getUnitStudents = async (req, res) => {
  try {
    const { unitId } = req.params;
    const result = await pool.query(
      `SELECT s.student_id, s.full_name, s.dob, s.gender, s.address, s.parent_name, s.parent_phone, s.admission_date,
              e.standard, e.division, e.roll_number, e.academic_year, e.passed, s.createdat, s.updatedat
         FROM students s
         JOIN enrollments e ON s.student_id = e.student_id
        WHERE s.unit_id = $1
        ORDER BY e.academic_year DESC, e.roll_number`,
      [unitId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getUnitStudents:', err);
    res.status(500).json({ error: err.message });
  }
};
