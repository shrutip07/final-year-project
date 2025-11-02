// const pool = require('../config/db');

// // GET /api/teacher/me
// exports.getMyProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const result = await pool.query(
//       `SELECT * FROM staff WHERE user_id = $1 AND staff_type = 'teaching'`,
//       [userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Teacher profile not found' });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Error in getMyProfile:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // POST /api/teacher
// exports.createProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       unit_id,
//       staff_type,
//       full_name,
//       phone,
//       email,
//       qualification,
//       designation,
//       subject // Only for teaching staff; can be empty for non-teaching
//     } = req.body;

//     // prevent duplicate onboarding
//     const exists = await pool.query('SELECT * FROM staff WHERE user_id = $1', [userId]);
//     if (exists.rows.length > 0) {
//       return res.status(400).json({ error: 'Profile already exists' });
//     }

//     await pool.query(
//       'INSERT INTO staff (user_id, unit_id, staff_type, full_name, phone, email, qualification, designation, subject) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
//       [userId, unit_id, staff_type, full_name, phone, email, qualification, designation, subject || null]
//     );

//     res.status(201).json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.addStudent = async (req, res) => {
//   try {
//     const { full_name, dob, gender, address, parent_name, parent_phone, admission_date, unit_id } = req.body;
//     const result = await pool.query(
//       `INSERT INTO students (full_name, dob, gender, address, parent_name, parent_phone, admission_date, unit_id)
//       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
//       [full_name, dob, gender, address, parent_name, parent_phone, admission_date, unit_id]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to add student." });
//   }
// };



// exports.updateStudent = async (req, res) => {
//   try {
//     const studentId = req.params.student_id;
//     const {
//       full_name, dob, gender, address, parent_name, parent_phone, admission_date
//     } = req.body;
//     await pool.query(
//       `UPDATE students SET full_name=$1, dob=$2, gender=$3, address=$4,
//         parent_name=$5, parent_phone=$6, admission_date=$7
//        WHERE student_id=$8`,
//       [full_name, dob, gender, address, parent_name, parent_phone, admission_date, studentId]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error("Update failed:", err);
//     res.status(500).json({ error: "Update failed." });
//   }
// };

// // PUT /api/teacher/:staff_id
// exports.updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       full_name,
//       email,
//       phone,
//       qualification,
//       designation,
//       subject
//     } = req.body;

//     const result = await pool.query(
//       `UPDATE staff 
//        SET full_name = $1, 
//            email = $2, 
//            phone = $3, 
//            qualification = $4, 
//            designation = $5, 
//            subject = $6,
//            updatedat = CURRENT_TIMESTAMP
//        WHERE user_id = $7 AND staff_type = 'teaching'
//        RETURNING *`,
//       [full_name, email, phone, qualification, designation, subject, userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Teacher profile not found' });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Error in updateProfile:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// exports.getMyStudents = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { academic_year } = req.query; // pass from frontend
//     // First get the teacher's unit_id
//     const teacherResult = await pool.query(
//       'SELECT unit_id FROM staff WHERE user_id = $1 AND staff_type = \'teaching\'',
//       [userId]
//     );
//     if (teacherResult.rows.length === 0) {
//       return res.status(404).json({ message: 'Teacher not found' });
//     }
//     const unitId = teacherResult.rows[0].unit_id;
//     // Join students profile with their current enrollment in this teacher's school+year
//     const studentsResult = await pool.query(`
//   SELECT s.student_id, s.full_name, s.dob, s.gender, s.address, s.parent_name, s.parent_phone, s.admission_date,
//          s.unit_id,
//          e.enrollment_id, e.standard, e.division, e.roll_number, e.academic_year, e.passed
//   FROM students s
//   JOIN enrollments e ON s.student_id = e.student_id
//   WHERE s.unit_id = $1 AND e.academic_year = $2
//   ORDER BY e.roll_number
// `, [unitId, academic_year]);
//     res.json(studentsResult.rows);
//   } catch (err) {
//     console.error('Error in getMyStudents:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// exports.onboard = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       full_name,
//       phone,
//       email,
//       qualification,
//       designation,
//       subject,
//       unit_id,
//       staff_type
//     } = req.body;

//     // Check if teacher profile already exists
//     const existing = await pool.query(
//       'SELECT * FROM staff WHERE user_id = $1',
//       [userId]
//     );

//     if (existing.rows.length > 0) {
//       return res.status(400).json({ 
//         message: 'Profile already exists' 
//       });
//     }

//     // Insert new teacher profile
//     const result = await pool.query(
//       `INSERT INTO staff (
//         user_id, full_name, phone, email, qualification,
//         designation, subject, unit_id, staff_type, joining_date
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
//       RETURNING *`,
//       [userId, full_name, phone, email, qualification, 
//        designation, subject, unit_id, staff_type]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Error in onboard:', err);
//     res.status(500).json({ 
//       message: 'Failed to complete onboarding' 
//     });
//   }
// };
// // Do NOT include unit_id

// exports.addEnrollment = async (req, res) => {
//   try {
//     const { student_id, academic_year, standard, division, roll_number, passed } = req.body;
//     const result = await pool.query(
//       `INSERT INTO enrollments (student_id, academic_year, standard, division, roll_number, passed)
//        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
//       [student_id, academic_year, standard, division, roll_number, passed ?? false]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error("[ENROLLMENT ERROR]", err); 
//     res.status(500).json({ error: "Failed to add enrollment.", detail: err.message });
//   }
// };



// exports.updateEnrollment = async (req, res) => {
//   try {
//     const enrollmentId = req.params.enrollment_id;
//     const { standard, division, roll_number, passed } = req.body;
//     const result = await pool.query(
//       `UPDATE enrollments
//        SET standard = $1, division = $2, roll_number = $3, passed = $4, updatedat = CURRENT_TIMESTAMP
//        WHERE enrollment_id = $5
//        RETURNING *`,
//       [standard, division, roll_number, passed, enrollmentId]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update enrollment." });
//   }
// };

// // GET /api/teacher/units
// exports.getUnits = async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT unit_id, kendrashala_name, semis_no 
//        FROM unit 
//        ORDER BY kendrashala_name`
//     );

//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error fetching units:', err);
//     res.status(500).json({ message: 'Failed to load schools' });
//   }
// };
// const pool = require('../config/db');

// // GET /api/teacher/me
// exports.getMyProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const result = await pool.query(
//       `SELECT * FROM staff WHERE user_id = $1 AND staff_type = 'teaching'`,
//       [userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Teacher profile not found' });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Error in getMyProfile:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // POST /api/teacher
// exports.createProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       unit_id,
//       staff_type,
//       full_name,
//       phone,
//       email,
//       qualification,
//       designation,
//       subject
//     } = req.body;

//     const exists = await pool.query('SELECT * FROM staff WHERE user_id = $1', [userId]);
//     if (exists.rows.length > 0) {
//       return res.status(400).json({ error: 'Profile already exists' });
//     }

//     await pool.query(
//       'INSERT INTO staff (user_id, unit_id, staff_type, full_name, phone, email, qualification, designation, subject) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
//       [userId, unit_id, staff_type, full_name, phone, email, qualification, designation, subject || null]
//     );

//     res.status(201).json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.addStudent = async (req, res) => {
//   try {
//     const { full_name, dob, gender, address, parent_name, parent_phone, admission_date, unit_id } = req.body;
//     const result = await pool.query(
//       `INSERT INTO students (full_name, dob, gender, address, parent_name, parent_phone, admission_date, unit_id)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
//       [full_name, dob, gender, address, parent_name, parent_phone, admission_date, unit_id]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to add student." });
//   }
// };

// exports.updateStudent = async (req, res) => {
//   try {
//     const studentId = req.params.student_id;
//     const {
//       full_name, dob, gender, address, parent_name, parent_phone, admission_date
//     } = req.body;
//     await pool.query(
//       `UPDATE students SET full_name=$1, dob=$2, gender=$3, address=$4,
//         parent_name=$5, parent_phone=$6, admission_date=$7
//        WHERE student_id=$8`,
//       [full_name, dob, gender, address, parent_name, parent_phone, admission_date, studentId]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error("Update failed:", err);
//     res.status(500).json({ error: "Update failed." });
//   }
// };

// exports.updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       full_name,
//       email,
//       phone,
//       qualification,
//       designation,
//       subject
//     } = req.body;

//     const result = await pool.query(
//       `UPDATE staff 
//        SET full_name = $1, 
//            email = $2, 
//            phone = $3, 
//            qualification = $4, 
//            designation = $5, 
//            subject = $6,
//            updatedat = CURRENT_TIMESTAMP
//        WHERE user_id = $7 AND staff_type = 'teaching'
//        RETURNING *`,
//       [full_name, email, phone, qualification, designation, subject, userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Teacher profile not found' });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Error in updateProfile:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.getMyStudents = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { academic_year } = req.query;
//     const teacherResult = await pool.query(
//       'SELECT unit_id FROM staff WHERE user_id = $1 AND staff_type = \'teaching\'',
//       [userId]
//     );
//     if (teacherResult.rows.length === 0) {
//       return res.status(404).json({ message: 'Teacher not found' });
//     }
//     const unitId = teacherResult.rows[0].unit_id;
//     const studentsResult = await pool.query(`
//       SELECT s.student_id, s.full_name, s.dob, s.gender, s.address, s.parent_name, s.parent_phone, s.admission_date,
//              s.unit_id,
//              e.enrollment_id, e.standard, e.division, e.roll_number, e.academic_year, e.passed
//       FROM students s
//       JOIN enrollments e ON s.student_id = e.student_id
//       WHERE s.unit_id = $1 AND e.academic_year = $2
//       ORDER BY e.roll_number
//     `, [unitId, academic_year]);
//     res.json(studentsResult.rows);
//   } catch (err) {
//     console.error('Error in getMyStudents:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.onboard = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       full_name,
//       phone,
//       email,
//       qualification,
//       designation,
//       subject,
//       unit_id,
//       staff_type
//     } = req.body;

//     const existing = await pool.query(
//       'SELECT * FROM staff WHERE user_id = $1',
//       [userId]
//     );

//     if (existing.rows.length > 0) {
//       return res.status(400).json({ 
//         message: 'Profile already exists' 
//       });
//     }

//     const result = await pool.query(
//       `INSERT INTO staff (
//         user_id, full_name, phone, email, qualification,
//         designation, subject, unit_id, staff_type, joining_date
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
//       RETURNING *`,
//       [userId, full_name, phone, email, qualification, 
//        designation, subject, unit_id, staff_type]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Error in onboard:', err);
//     res.status(500).json({ 
//       message: 'Failed to complete onboarding' 
//     });
//   }
// };

// exports.addEnrollment = async (req, res) => {
//   try {
//     const { student_id, academic_year, standard, division, roll_number, passed } = req.body;
//     const result = await pool.query(
//       `INSERT INTO enrollments (student_id, academic_year, standard, division, roll_number, passed)
//        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
//       [student_id, academic_year, standard, division, roll_number, passed ?? false]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error("[ENROLLMENT ERROR]", err); 
//     res.status(500).json({ error: "Failed to add enrollment.", detail: err.message });
//   }
// };

// exports.updateEnrollment = async (req, res) => {
//   try {
//     const enrollmentId = req.params.enrollment_id;
//     const { standard, division, roll_number, passed } = req.body;
//     const result = await pool.query(
//       `UPDATE enrollments
//        SET standard = $1, division = $2, roll_number = $3, passed = $4, updatedat = CURRENT_TIMESTAMP
//        WHERE enrollment_id = $5
//        RETURNING *`,
//       [standard, division, roll_number, passed, enrollmentId]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update enrollment." });
//   }
// };

// exports.getUnits = async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT unit_id, kendrashala_name, semis_no 
//        FROM unit 
//        ORDER BY kendrashala_name`
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error fetching units:', err);
//     res.status(500).json({ message: 'Failed to load schools' });
//   }
// };
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

exports.addStudent = async (req, res) => {
  try {
    const { full_name, dob, gender, address, parent_name, parent_phone, admission_date, unit_id } = req.body;
    const result = await pool.query(
      `INSERT INTO students (full_name, dob, gender, address, parent_name, parent_phone, admission_date, unit_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [full_name, dob, gender, address, parent_name, parent_phone, admission_date, unit_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add student." });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const studentId = req.params.student_id;
    const {
      full_name, dob, gender, address, parent_name, parent_phone, admission_date
    } = req.body;
    await pool.query(
      `UPDATE students SET full_name=$1, dob=$2, gender=$3, address=$4,
        parent_name=$5, parent_phone=$6, admission_date=$7
       WHERE student_id=$8`,
      [full_name, dob, gender, address, parent_name, parent_phone, admission_date, studentId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Update failed." });
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

exports.getMyStudents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { academic_year } = req.query;
    const teacherResult = await pool.query(
      'SELECT unit_id FROM staff WHERE user_id = $1 AND staff_type = \'teaching\'',
      [userId]
    );
    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const unitId = teacherResult.rows[0].unit_id;

    let studentsResult;
    if (academic_year === "all") {
      studentsResult = await pool.query(`
        SELECT s.student_id, s.full_name, s.dob, s.gender, s.address, s.parent_name, s.parent_phone, s.admission_date,
               s.unit_id,
               e.enrollment_id, e.standard, e.division, e.roll_number, e.academic_year, e.passed
        FROM students s
        JOIN enrollments e ON s.student_id = e.student_id
        WHERE s.unit_id = $1
        ORDER BY e.academic_year DESC, e.roll_number
      `, [unitId]);
    } else {
      studentsResult = await pool.query(`
        SELECT s.student_id, s.full_name, s.dob, s.gender, s.address, s.parent_name, s.parent_phone, s.admission_date,
               s.unit_id,
               e.enrollment_id, e.standard, e.division, e.roll_number, e.academic_year, e.passed
        FROM students s
        JOIN enrollments e ON s.student_id = e.student_id
        WHERE s.unit_id = $1 AND e.academic_year = $2
        ORDER BY e.roll_number
      `, [unitId, academic_year]);
    }
    res.json(studentsResult.rows);
  } catch (err) {
    console.error('Error in getMyStudents:', err);
    res.status(500).json({ message: 'Server error' });
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

exports.addEnrollment = async (req, res) => {
  try {
    const { student_id, academic_year, standard, division, roll_number, passed } = req.body;
    const result = await pool.query(
      `INSERT INTO enrollments (student_id, academic_year, standard, division, roll_number, passed)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [student_id, academic_year, standard, division, roll_number, passed ?? false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[ENROLLMENT ERROR]", err); 
    res.status(500).json({ error: "Failed to add enrollment.", detail: err.message });
  }
};

exports.updateEnrollment = async (req, res) => {
  try {
    const enrollmentId = req.params.enrollment_id;
    const { standard, division, roll_number, passed } = req.body;
    const result = await pool.query(
      `UPDATE enrollments
       SET standard = $1, division = $2, roll_number = $3, passed = $4, updatedat = CURRENT_TIMESTAMP
       WHERE enrollment_id = $5
       RETURNING *`,
      [standard, division, roll_number, passed, enrollmentId]
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
