
const pool = require('../config/db');

// GET /api/teacher/me
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM staff WHERE user_id = $1 AND staff_type = 'teaching'`,
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in getMyProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/teacher
exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      unit_id,
      staff_type,
      full_name,
      phone,
      email,
      qualification,
      designation,
      subject
    } = req.body;

    const exists = await pool.query('SELECT * FROM staff WHERE user_id = $1', [userId]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Profile already exists' });
    }

    await pool.query(
      'INSERT INTO staff (user_id, unit_id, staff_type, full_name, phone, email, qualification, designation, subject) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [userId, unit_id, staff_type, full_name, phone, email, qualification, designation, subject || null]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      email,
      phone,
      qualification,
      designation,
      subject
    } = req.body;

    const result = await pool.query(
      `UPDATE staff 
       SET full_name = $1, 
           email = $2, 
           phone = $3, 
           qualification = $4, 
           designation = $5, 
           subject = $6,
           updatedat = CURRENT_TIMESTAMP
       WHERE user_id = $7 AND staff_type = 'teaching'
       RETURNING *`,
      [full_name, email, phone, qualification, designation, subject, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in updateProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
// GET /api/teacher/students
// Teacher sees only students in classes assigned in teacher_class_assignments
exports.getMyStudents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { academic_year } = req.query;

    // Get teacher staff_id and unit_id
    const teacherResult = await pool.query(
      "SELECT staff_id, unit_id FROM staff WHERE user_id = $1 AND staff_type = 'teaching'",
      [userId]
    );
    if (!teacherResult.rows.length) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    const { staff_id, unit_id } = teacherResult.rows[0];

    // Decide which academic year to use
    let yearParam = academic_year;
    if (!yearParam || yearParam === "all") {
      const { rows: yRows } = await pool.query(
        `SELECT DISTINCT academic_year
         FROM teacher_class_assignments
         WHERE staff_id = $1
         ORDER BY academic_year DESC
         LIMIT 1`,
        [staff_id]
      );
      if (yRows.length) {
        yearParam = yRows[0].academic_year;
      } else {
        // No assignments yet
        return res.json([]);
      }
    }

    const params = [staff_id, unit_id, yearParam];

    const query = `
      SELECT
        s.student_id,
        s.full_name,
        s.dob,
        s.gender,
        s.address,
        s.parent_name,
        s.parent_phone,
        s.admission_date,
        s.unit_id,
        e.enrollment_id,
        e.standard,
        e.division,
        e.roll_number,
        e.academic_year,
        e.passed,
        e.percentage
      FROM teacher_class_assignments tca
      JOIN enrollments e
        ON e.academic_year = tca.academic_year
       AND e.standard = tca.standard
       AND e.division = tca.division
      JOIN students s
        ON s.student_id = e.student_id
      WHERE tca.staff_id = $1
        AND s.unit_id = $2
        AND e.academic_year = $3
      ORDER BY e.standard, e.division, e.roll_number, s.full_name
    `;

    const studentsResult = await pool.query(query, params);
    res.json(studentsResult.rows);
  } catch (err) {
    console.error("Error in getMyStudents:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADDED: GET /api/teacher/academic-years
exports.getAcademicYears = async (req, res) => {
  try {
    const userId = req.user.id;
    const teacherResult = await pool.query(
      'SELECT unit_id FROM staff WHERE user_id = $1 AND staff_type = \'teaching\'',
      [userId]
    );
    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const unitId = teacherResult.rows[0].unit_id;
    const yearsResult = await pool.query(
      `
      SELECT DISTINCT e.academic_year FROM enrollments e
      JOIN students s ON s.student_id = e.student_id
      WHERE s.unit_id = $1
      ORDER BY e.academic_year DESC
      `,
      [unitId]
    );
    res.json(yearsResult.rows.map(obj => obj.academic_year));
  } catch (err) {
    res.status(500).json({ message: 'Failed to load years' });
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
      designation,
      subject,
      unit_id,
      staff_type
    } = req.body;

    const existing = await pool.query(
      'SELECT * FROM staff WHERE user_id = $1',
      [userId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Profile already exists' 
      });
    }

    const result = await pool.query(
      `INSERT INTO staff (
        user_id, full_name, phone, email, qualification,
        designation, subject, unit_id, staff_type, joining_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
      RETURNING *`,
      [userId, full_name, phone, email, qualification, 
       designation, subject, unit_id, staff_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error in onboard:', err);
    res.status(500).json({ 
      message: 'Failed to complete onboarding' 
    });
  }
};



exports.updateEnrollment = async (req, res) => {
  try {
    const enrollmentId = req.params.enrollment_id;
    const { standard, division, roll_number, passed,percentage } = req.body;
    const result = await pool.query(
      `UPDATE enrollments
       SET standard = $1, division = $2, roll_number = $3, passed = $4,percentage=$5, updatedat = CURRENT_TIMESTAMP
       WHERE enrollment_id = $6
       RETURNING *`,
      [standard, division, roll_number, passed,percentage, enrollmentId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update enrollment." });
  }
};

exports.getUnits = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT unit_id, kendrashala_name, semis_no 
       FROM unit 
       ORDER BY kendrashala_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching units:', err);
    res.status(500).json({ message: 'Failed to load schools' });
  }
};
// Mark teacher's assignments done for a year
// exports.markYearDone = async (req, res) => {
// try {
// const userId = req.user.id;
// const { academic_year } = req.body;


// if (!academic_year) {
//   return res.status(400).json({ message: "academic_year is required" });
// }

// const teacherResult = await pool.query(
//   "SELECT staff_id FROM staff WHERE user_id = $1 AND staff_type = 'teaching'",
//   [userId]
// );
// if (!teacherResult.rows.length) {
//   return res.status(404).json({ message: "Teacher not found" });
// }
// const staff_id = teacherResult.rows.staff_id;

// const result = await pool.query(
//   `UPDATE teacher_class_assignments
//      SET done_for_year = TRUE,
//          updatedat = NOW()
//    WHERE staff_id = $1
//      AND academic_year = $2`,
//   [staff_id, academic_year]
// );

// return res.json({ success: true, updated: result.rowCount });
// } catch (err) {
// console.error("markYearDone error:", err);
// return res.status(500).json({ message: "Failed to mark year as done" });
// }
// };
exports.markYearDone = async (req, res) => {
try {
const userId = req.user.id;
const { academic_year } = req.body;
if (!academic_year) {
  return res.status(400).json({ message: "academic_year is required" });
}

const teacherResult = await pool.query(
  "SELECT staff_id FROM staff WHERE user_id = $1 AND staff_type = 'teaching'",
  [userId]
);
if (!teacherResult.rows.length) {
  return res.status(404).json({ message: "Teacher not found" });
}
const staff_id = teacherResult.rows.staff_id;

const result = await pool.query(
  `UPDATE teacher_class_assignments
     SET done_for_year = TRUE,
         updatedat = NOW()
   WHERE staff_id = $1
     AND academic_year = $2`,
  [staff_id, academic_year]
);

return res.json({ success: true, updated: result.rowCount });
} catch (err) {
console.error("markYearDone error:", err);
return res.status(500).json({ message: "Failed to mark year as done" });
}
};

exports.getMyClasses = async (req, res) => {
try {
const userId = req.user.id;
const { academic_year } = req.query;


const teacherResult = await pool.query(
  "SELECT staff_id FROM staff WHERE user_id = $1 AND staff_type = 'teaching'",
  [userId]
);
if (!teacherResult.rows.length) {
  return res.status(404).json({ message: "Teacher not found" });
}
const staff_id = teacherResult.rows[0].staff_id;

const params = [staff_id];
let whereYear = "";
if (academic_year) {
  whereYear = "AND academic_year = $2";
  params.push(academic_year);
}

const { rows } = await pool.query(
  `SELECT DISTINCT academic_year, standard, division
     FROM teacher_class_assignments
    WHERE staff_id = $1 ${whereYear}
    ORDER BY academic_year DESC, standard, division`,
  params
);

res.json(rows);
} catch (err) {
console.error("getMyClasses error:", err);
res.status(500).json({ message: "Failed to load classes" });
}
};