const pool = require('../config/db');

// Get all units/schools for the dashboard
exports.getUnits = async (req, res) => {
  try {
    console.log('Fetching units...'); // Debug log
    const result = await pool.query('SELECT * FROM unit');
    console.log('Units found:', result.rows.length); // Debug log
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getUnits:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all teaching staff for a unit
exports.getUnitTeachers = async (req, res) => {
  try {
    const { unitId } = req.params;
    console.log('Fetching teachers for unit:', unitId); // Debug log
    
    const result = await pool.query(
      `SELECT staff_id, full_name, email, phone, qualification, 
              designation, subject, joining_date, updatedat
       FROM staff 
       WHERE unit_id = $1 AND staff_type = 'teaching'`,
      [unitId]
    );
    console.log('Teachers found:', result.rows.length); // Debug log
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getUnitTeachers:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all students for a unit
exports.getUnitStudents = async (req, res) => {
  try {
    const { unitId } = req.params;
    console.log('Fetching students for unit:', unitId); // Debug log
    
    const result = await pool.query(
      `SELECT student_id, full_name, standard, division, roll_number,
              dob, gender, address, parent_name, parent_phone, 
              createdat, updatedat
       FROM students 
       WHERE unit_id = $1`,
      [unitId]
    );
    console.log('Students found:', result.rows.length); // Debug log
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getUnitStudents:', err);
    res.status(500).json({ error: err.message });
  }
};
