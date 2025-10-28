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
      subject // Only for teaching staff; can be empty for non-teaching
    } = req.body;

    // prevent duplicate onboarding
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

// GET /api/teacher/students
exports.getStudents = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("LOG: Logged-in userId:", userId);

    // Get teacher's unit_id correctly (fix here: access first element in rows)
    const staff = await pool.query("SELECT unit_id FROM staff WHERE user_id = $1", [userId]);
    console.log("LOG: Staff record:", staff.rows);

    if (!staff.rows.length) return res.status(404).json({ error: "No teacher profile found." });

    const unitId = staff.rows[0].unit_id;
    console.log("LOG: unitId used for students query:", unitId);

    const students = await pool.query(
      `SELECT student_id, full_name, standard, division, roll_number, dob, gender, address, parent_name, parent_phone 
       FROM students WHERE unit_id = $1`,
      [unitId]
    );

    console.log("LOG: Students fetched:", students.rows);

    res.json(students.rows);
  } catch (err) {
    console.error("ERROR in getStudents:", err);
    res.status(500).json({ error: "Failed to fetch students." });
  }
};
exports.addStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get the teacher's unit_id
    const staff = await pool.query("SELECT unit_id FROM staff WHERE user_id = $1", [userId]);
    if (!staff.rows.length) return res.status(404).json({ error: "No staff found." });
    const unitId = staff.rows[0].unit_id;
    const {
      full_name,
      standard,
      division,
      roll_number,
      dob,
      gender,
      address,
      parent_name,
      parent_phone
    } = req.body;
    const result = await pool.query(
      `INSERT INTO students (unit_id, full_name, standard, division, roll_number, dob, gender, address, parent_name, parent_phone)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [unitId, full_name, standard, division, roll_number, dob, gender, address, parent_name, parent_phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add student." });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const studentId = req.params.student_id;
    const { full_name, standard, division, roll_number, dob, gender, address, parent_name, parent_phone } = req.body;
    // Optionally, verify teacher has permission for this student via unit_id
    await pool.query(
      `UPDATE students SET full_name=$1, standard=$2, division=$3, roll_number=$4, dob=$5,
        gender=$6, address=$7, parent_name=$8, parent_phone=$9 WHERE student_id=$10`,
      [full_name, standard, division, roll_number, dob, gender, address, parent_name, parent_phone, studentId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed." });
  }
};


// PUT /api/teacher/:staff_id
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
exports.getMyStudents = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching students for teacher:', userId); // Debug log

    // First get the teacher's unit_id
    const teacherResult = await pool.query(
      'SELECT unit_id FROM staff WHERE user_id = $1 AND staff_type = \'teaching\'',
      [userId]
    );

    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const unitId = teacherResult.rows[0].unit_id;

    // Then get all students in that unit
    const studentsResult = await pool.query(
      `SELECT student_id, roll_number, full_name, standard, division,
              parent_name, parent_phone 
       FROM students 
       WHERE unit_id = $1
       ORDER BY roll_number`,
      [unitId]
    );

    res.json(studentsResult.rows);
  } catch (err) {
    console.error('Error in getMyStudents:', err);
    res.status(500).json({ message: 'Server error' });
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

    // Check if teacher profile already exists
    const existing = await pool.query(
      'SELECT * FROM staff WHERE user_id = $1',
      [userId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Profile already exists' 
      });
    }

    // Insert new teacher profile
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

// GET /api/teacher/units
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
