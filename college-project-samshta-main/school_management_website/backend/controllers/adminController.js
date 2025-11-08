

const pool = require('../config/db');
// Create a new form with questions (admin)

exports.createForm = async (req, res) => {
  const { title, description, receiver_role, deadline, questions } = req.body;
  const created_by = req.user.id;

  if (!title || !receiver_role || !deadline || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const formResult = await client.query(
      `INSERT INTO forms (title, description, created_by, receiver_role, deadline) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, created_by, receiver_role, deadline]
    );
    const formId = formResult.rows[0].id;

    // Insert questions
    for (const q of questions) {
      await client.query(
        `INSERT INTO form_questions (form_id, question_text, question_type, options)
         VALUES ($1, $2, $3, $4)`,
        [formId, q.question_text, q.question_type, q.options || null]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ success: true, form: formResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("CreateForm error:", err);
    res.status(500).json({ error: "Failed to create form" });
  } finally {
    client.release();
  }
};

// Get all active forms for a role (for principal/teacher view)
exports.getActiveForms = async (req, res) => {
  const { role } = req.query; // 'principal' or 'teacher'
  const now = new Date();

  try {
    const formsRes = await pool.query(
      `SELECT * FROM forms 
       WHERE receiver_role=$1 AND is_active=TRUE AND deadline > $2
       ORDER BY created_at DESC`,
      [role, now]
    );
    res.json(formsRes.rows);
  } catch (err) {
    console.error("getActiveForms error:", err);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
};

// Get form questions for a given form
exports.getFormQuestions = async (req, res) => {
  const { formId } = req.params;
  try {
    const questionsRes = await pool.query(
      `SELECT * FROM form_questions WHERE form_id = $1`,
      [formId]
    );
    res.json(questionsRes.rows);
  } catch (err) {
    console.error("getFormQuestions error:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

// Submit a filled form
exports.submitFormResponse = async (req, res) => {
  const { formId } = req.params;
  const { answers } = req.body;

  console.log("submitFormResponse:", { user: req.user, formId, answers });

  // FIX: Accept both school_id and unit_id as fallback
  let school_id = req.user?.school_id;
  if (!school_id && req.user.unit_id) {
    school_id = req.user.unit_id;
  }
  const submitted_by = req.user?.id;

  if (!school_id || !submitted_by) {
    return res.status(400).json({ error: "Missing user or school context." });
  }
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "Answers required and should not be empty." });
  }
  for (const ans of answers) {
    if (!ans.question_id || typeof ans.answer === "undefined") {
      return res.status(400).json({ error: "Malformed question or answer." });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const respRes = await client.query(
      `INSERT INTO form_responses (form_id, school_id, submitted_by) 
       VALUES ($1, $2, $3) RETURNING *`,
      [formId, school_id, submitted_by]
    );
    const responseId = respRes.rows[0].id;
    for (const ans of answers) {
      await client.query(
        `INSERT INTO form_answers (response_id, question_id, answer)
         VALUES ($1, $2, $3)`,
        [responseId, ans.question_id, ans.answer]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("submitFormResponse error:", err); // <--- READ CONSOLE OUTPUT!
    res.status(500).json({ error: "Failed to submit response" });
  } finally {
    client.release();
  }
};
exports.getAllFormResponses = async (req, res) => {
  try {
    // Adjust table/column names to match your schema
    const result = await pool.query('SELECT * FROM form_answers ORDER BY submitted_at DESC');
    // You can join other tables for more details if needed
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error fetching form responses:', err);
    res.status(500).json({ message: 'Failed to retrieve form responses' });
  }
};

// Get all responses for a form (admin/creator view)
exports.getFormResponses = async (req, res) => {
  const { formId } = req.params;
  try {
    // Get responses, then answers for each response
    const respRes = await pool.query(
      `SELECT * FROM form_responses WHERE form_id = $1`,
      [formId]
    );
    const responses = respRes.rows;
    for (let response of responses) {
      const answersRes = await pool.query(
        `SELECT fa.*, fq.question_text, fq.question_type 
         FROM form_answers fa
         JOIN form_questions fq ON fa.question_id = fq.id
         WHERE fa.response_id = $1`,
        [response.id]
      );
      response.answers = answersRes.rows;
    }
    res.json(responses);
  } catch (err) {
    console.error("getFormResponses error:", err);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
};

// Discard/Deactivate a form
exports.deactivateForm = async (req, res) => {
  const { formId } = req.params;
  try {
    await pool.query(
      `UPDATE forms SET is_active = FALSE WHERE id = $1`,
      [formId]
    );
    res.json({ success: true, message: "Form deactivated" });
  } catch (err) {
    console.error("deactivateForm error:", err);
    res.status(500).json({ error: "Failed to deactivate form" });
  }
};

// ...rest of your code (analytics, units, students) remains the same...

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
    if (!Array.isArray(units) || units.length === 0) {
      return res.json([]);
    }

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
          staff_count: parseInt(staffRes.rows[0].count || 0),
          student_count: parseInt(studentRes.rows[0].count || 0)
        };
      })
    );

    res.json(enrichedUnits);
  } catch (err) {
    console.error('Error in getUnits:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch units.' });
  }
};

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
    const budgetsResult = await pool.query(
      'SELECT * FROM unit_budgets WHERE unit_id = $1 ORDER BY fiscal_year, version', [unitId]
    );
    const banksResult = await pool.query(
      'SELECT * FROM unit_banks WHERE unit_id = $1 ORDER BY bank_id', [unitId]
    );
    const casesResult = await pool.query(
      'SELECT * FROM unit_cases WHERE unit_id = $1 ORDER BY id', [unitId]
    );
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
    res.status(500).json({ error: err.message || "Failed to load unit detail." });
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
