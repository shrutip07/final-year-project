const pool = require('../config/db');

// GET /api/principal/me - fetch principal profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM principal WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.json({ exists: false });
    }
    res.json({ exists: true, profile: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/principal - onboarding (store in principal table!)
exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      unit_id,
      full_name,
      phone,
      email,
      qualification,
      joining_date,
      tenure_start_date,
      tenure_end_date,
      status
    } = req.body;

    // prevent duplicate onboarding
    const exists = await pool.query('SELECT * FROM principal WHERE user_id = $1', [userId]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Principal profile already exists' });
    }

    await pool.query(
      'INSERT INTO principal (user_id, unit_id, full_name, phone, email, qualification, joining_date, tenure_start_date, tenure_end_date, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [userId, unit_id, full_name, phone, email, qualification, joining_date || null, tenure_start_date || null, tenure_end_date || null, status || 'active']
    );

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/principal/:principal_id - edit principal profile
exports.updateProfile = async (req, res) => {
  try {
    const principalId = req.params.principal_id;
    const userId = req.user.id;
    const {
      unit_id,         // Added unit_id
      full_name,
      phone,
      email,
      qualification,
      joining_date,
      tenure_start_date,
      tenure_end_date,
      status
    } = req.body;

    // Verify principal exists and belongs to user
    const principal = await pool.query(
      'SELECT * FROM principal WHERE principal_id = $1 AND user_id = $2',
      [principalId, userId]
    );

    if (principal.rows.length === 0) {
      return res.status(404).json({ error: 'Principal profile not found' });
    }

    const result = await pool.query(
      `UPDATE principal 
       SET unit_id = COALESCE($1, unit_id),
           full_name = COALESCE($2, full_name), 
           phone = COALESCE($3, phone), 
           email = COALESCE($4, email), 
           qualification = COALESCE($5, qualification),
           joining_date = COALESCE($6, joining_date),
           tenure_start_date = COALESCE($7, tenure_start_date),
           tenure_end_date = COALESCE($8, tenure_end_date),
           status = COALESCE($9, status),
           updatedat = CURRENT_TIMESTAMP
       WHERE principal_id = $10 AND user_id = $11
       RETURNING *`,
      [
        unit_id,
        full_name,
        phone,
        email,
        qualification,
        joining_date,
        tenure_start_date,
        tenure_end_date,
        status,
        principalId,
        userId
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in updateProfile:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add this new function to get teachers from same unit
exports.getTeachers = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching teachers for user:', userId);

    // First get principal's unit_id
    const principalResult = await pool.query(
      'SELECT unit_id FROM principal WHERE user_id = $1',
      [userId]
    );

    console.log('Principal result:', principalResult.rows);

    if (principalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Principal profile not found' });
    }

    const unitId = principalResult.rows[0].unit_id;
    console.log('Unit ID:', unitId);

    // Modified query to only select columns that exist in the staff table
    const teachersResult = await pool.query(
      `SELECT 
        staff_id, 
        full_name, 
        email, 
        qualification, 
        designation, 
        subject, 
        phone, 
        joining_date
       FROM staff 
       WHERE unit_id = $1 AND staff_type = $2`,
      [unitId, 'teaching']
    );

    console.log('Found teachers:', teachersResult.rows.length);
    res.json(teachersResult.rows);
  } catch (err) {
    console.error('Error in getTeachers:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add this new function after getTeachers
exports.getStudents = async (req, res) => {
  try {
    const userId = req.user.id;

    // First get principal's unit_id
    const principalResult = await pool.query(
      'SELECT unit_id FROM principal WHERE user_id = $1',
      [userId]
    );

    if (principalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Principal profile not found' });
    }

    const unitId = principalResult.rows[0].unit_id;

    // Get all students from the same unit
    const studentsResult = await pool.query(
      `SELECT 
        student_id,
        roll_number,
        full_name,
        standard,
        division,
        dob,
        gender,
        address,
        parent_name,
        parent_phone,
        createdat,
        updatedat
       FROM students 
       WHERE unit_id = $1
       ORDER BY roll_number ASC`,
      [unitId]
    );

    console.log('Found students:', studentsResult.rows.length); // Debug log
    res.json(studentsResult.rows);
  } catch (err) {
    console.error('Error in getStudents:', err);
    res.status(500).json({ error: err.message });
  }
};

