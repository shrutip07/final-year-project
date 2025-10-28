// const pool = require('../config/db');

// // Get principal profile
// exports.getProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const result = await pool.query(
//       `SELECT * FROM principal WHERE user_id = $1`,
//       [userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Principal profile not found' });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Error in getProfile:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Onboard new principal
// exports.onboard = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       full_name,
//       phone,
//       email,
//       qualification,
//       unit_id,
//       joining_date,
//       tenure_start_date,
//       tenure_end_date,
//       status
//     } = req.body;

//     console.log("Received data:", req.body); // Debug log

//     // Insert new principal profile
//     const result = await pool.query(
//       `INSERT INTO principal (
//         user_id,
//         unit_id,
//         full_name,
//         phone,
//         email,
//         qualification,
//         joining_date,
//         tenure_start_date,
//         tenure_end_date,
//         status
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//       RETURNING *`,
//       [
//         userId,        // $1
//         unit_id,       // $2
//         full_name,     // $3
//         phone,         // $4
//         email,         // $5
//         qualification, // $6
//         joining_date || new Date(), // $7
//         tenure_start_date,          // $8
//         tenure_end_date,            // $9
//         status || 'active'          // $10
//       ]
//     );

//     console.log("Insert result:", result.rows[0]); // Debug log

//     res.status(201).json({
//       success: true,
//       data: result.rows[0]
//     });

//   } catch (err) {
//     console.error('Onboarding error details:', err);
//     res.status(500).json({ 
//       success: false,
//       message: err.message 
//     });
//   }
// };

// // Update principal profile
// exports.updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const {
//       full_name,
//       phone,
//       email,
//       qualification,
//       joining_date,
//       tenure_start_date,
//       tenure_end_date,
//       status
//     } = req.body;

//     const result = await pool.query(
//       `UPDATE principal 
//        SET full_name = $1, 
//            phone = $2, 
//            email = $3, 
//            qualification = $4,
//            joining_date = $5, 
//            tenure_start_date = $6, 
//            tenure_end_date = $7,
//            status = $8, 
//            updatedAt = CURRENT_TIMESTAMP
//        WHERE user_id = $9
//        RETURNING *`,
//       [full_name, phone, email, qualification, joining_date,
//        tenure_start_date, tenure_end_date, status, userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Principal profile not found' });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Error in updateProfile:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get all teachers (remains the same but uses principal table for unit_id lookup)
// exports.getTeachers = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     // Get principal's unit_id from principal table
//     const principalResult = await pool.query(
//       'SELECT unit_id FROM principal WHERE user_id = $1',
//       [userId]
//     );

//     if (principalResult.rows.length === 0) {
//       return res.status(404).json({ message: 'Principal profile not found' });
//     }

//     const unitId = principalResult.rows[0].unit_id;

//     // Get all teachers in the unit
//     const teachersResult = await pool.query(
//       `SELECT * FROM staff 
//        WHERE unit_id = $1 AND staff_type = 'teaching'
//        ORDER BY full_name`,
//       [unitId]
//     );

//     res.json(teachersResult.rows);
//   } catch (err) {
//     console.error('Error in getTeachers:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get all students (remains the same but uses principal table for unit_id lookup)
// exports.getStudents = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     // Get principal's unit_id from principal table
//     const principalResult = await pool.query(
//       'SELECT unit_id FROM principal WHERE user_id = $1',
//       [userId]
//     );

//     if (principalResult.rows.length === 0) {
//       return res.status(404).json({ message: 'Principal profile not found' });
//     }

//     const unitId = principalResult.rows[0].unit_id;

//     // Get all students in the unit
//     const studentsResult = await pool.query(
//       `SELECT student_id, full_name, standard, division, roll_number,
//               parent_name, parent_phone 
//        FROM students 
//        WHERE unit_id = $1
//        ORDER BY standard, division, roll_number`,
//       [unitId]
//     );

//     res.json(studentsResult.rows);
//   } catch (err) {
//     console.error('Error in getStudents:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



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

    // Get all students in the unit
    const studentsResult = await pool.query(
      `SELECT student_id, full_name, standard, division, roll_number,
              parent_name, parent_phone 
       FROM students 
       WHERE unit_id = $1
       ORDER BY standard, division, roll_number`,
      [unitId]
    );

    res.json(studentsResult.rows);
  } catch (err) {
    console.error('Error in getStudents:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// New handler: Get Data for principal dashboard with profile, unit info, and counts
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch principal profile
    const principalRes = await pool.query('SELECT * FROM principal WHERE user_id = $1', [userId]);
    if (principalRes.rows.length === 0) {
      return res.status(404).json({ message: 'Principal profile not found' });
    }
    const principal = principalRes.rows[0];
    const unitId = principal.unit_id;

    // Fetch unit info columns
    const unitRes = await pool.query(
      `SELECT 
        unit_id, semis_no, dcf_no, nmms_no, scholarship_code,
        first_grant_in_aid_year, type_of_management, school_jurisdiction,
        competent_authority_name, authority_number, authority_zone,
        kendrashala_name, info_authority_name, appellate_authority_name,
        midday_meal_org_name, midday_meal_org_contact, standard_range,
        headmistress_name, headmistress_phone, headmistress_email, school_shift
       FROM unit WHERE unit_id = $1`,
      [unitId]
    );
    const unit = unitRes.rows[0] || null;

    // Fetch teacher count
    const teacherCountRes = await pool.query(
      'SELECT COUNT(*) FROM staff WHERE unit_id = $1 AND staff_type = $2',
      [unitId, 'teaching']
    );
    const teacherCount = parseInt(teacherCountRes.rows[0].count, 10);

    // Fetch student count
    const studentCountRes = await pool.query(
      'SELECT COUNT(*) FROM students WHERE unit_id = $1',
      [unitId]
    );
    const studentCount = parseInt(studentCountRes.rows[0].count, 10);

    res.json({ principal, unit, teacherCount, studentCount });

  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
