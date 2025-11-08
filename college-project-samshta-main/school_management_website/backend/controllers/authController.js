// // const pool = require('../config/db');
// // const bcrypt = require('bcryptjs');
// // const jwt = require('jsonwebtoken');

// // // Register User
// // exports.register = async (req, res) => {
// //   try {
// //     const { email, password, role } = req.body;
// //     console.log('Registration attempt:', { email, role });

// //     if (!email || !password || !role) {
// //       return res.status(400).json({ 
// //           message: 'Please provide email, password and role' 
// //       });
// //     }

// //     // Check if user already exists - note the case sensitivity in table name
// //     const userExists = await pool.query(
// //       'SELECT * FROM "Users" WHERE email = $1',
// //       [email]
// //     );

// //     if (userExists.rows.length > 0) {
// //       return res.status(400).json({ message: 'User already exists' });
// //     }

// //     // Hash password
// //     const salt = await bcrypt.genSalt(10);
// //     const hashedPassword = await bcrypt.hash(password, salt);

// //     // Create new user - note the case sensitivity in table name
// //     const result = await pool.query(
// //       'INSERT INTO "Users" (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
// //       [email, hashedPassword, role]
// //     );

// //     const user = result.rows[0];
// //     console.log('User created:', user);

// //     const token = jwt.sign(
// //       { id: user.id, email: user.email, role: user.role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: '24h' }
// //     );

// //     // If it's a teacher or principal, they need to complete onboarding
// //     if (role === 'teacher' || role === 'principal') {
// //       return res.status(201).json({
// //         token,
// //         message: 'Registration successful. Please complete your profile.',
// //         requiresOnboarding: true
// //       });
// //     }

// //     res.status(201).json({ token });
// //   } catch (err) {
// //     console.error('Registration error:', err);
// //     res.status(500).json({ message: 'Something went wrong' });
// //   }
// // };

// // // 📌 LOGIN USER
// // exports.login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
    
// //     const user = await pool.query(
// //       'SELECT * FROM "Users" WHERE email = $1',
// //       [email]
// //     );

// //     if (user.rows.length === 0) {
// //       return res.status(401).json({ message: 'Invalid credentials' });
// //     }

// //     const validPassword = await bcrypt.compare(password, user.rows[0].password);
// //     if (!validPassword) {
// //       return res.status(401).json({ message: 'Invalid credentials' });
// //     }

// //     const token = jwt.sign(
// //       { id: user.rows[0].id, role: user.rows[0].role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: '24h' }
// //     );

// //     res.json({ token });
// //   } catch (error) {
// //     console.error('Login error:', error);
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // };

// // // 📌 VERIFY TOKEN
// // exports.verify = async (req, res) => {
// //   try {
// //     const token = req.headers.authorization?.split(' ')[1];
// //     if (!token) {
// //       return res.status(401).json({ error: 'No token provided' });
// //     }

// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     res.json({ valid: true, user: decoded });
// //   } catch (error) {
// //     res.status(401).json({ error: 'Invalid token' });
// //   }
// // };
// const pool = require('../config/db');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // Register User
// exports.register = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     console.log('Registration attempt:', { email, role });

//     if (!email || !password || !role) {
//       return res.status(400).json({
//         message: 'Please provide email, password and role'
//       });
//     }

//     // Check if user already exists
//     const userExists = await pool.query(
//       'SELECT * FROM "Users" WHERE email = $1',
//       [email]
//     );

//     if (userExists.rows.length > 0) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create new user
//     const result = await pool.query(
//       'INSERT INTO "Users" (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role, unit_id',
//       [email, hashedPassword, role]
//     );

//     const user = result.rows[0];
//     console.log('User created:', user);

//     // Add unit_id if it's a teacher or principal
//     const tokenPayload =
//       (role === 'teacher' || role === 'principal')
//         ? { id: user.id, email: user.email, role: user.role, unit_id: user.unit_id }
//         : { id: user.id, email: user.email, role: user.role };

//     const token = jwt.sign(
//       tokenPayload,
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     if (role === 'teacher' || role === 'principal') {
//       return res.status(201).json({
//         token,
//         message: 'Registration successful. Please complete your profile.',
//         requiresOnboarding: true
//       });
//     }

//     res.status(201).json({ token });
//   } catch (err) {
//     console.error('Registration error:', err);
//     res.status(500).json({ message: 'Something went wrong' });
//   }
// };

// // 📌 LOGIN USER
// // exports.login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     const userResult = await pool.query(
// //       'SELECT * FROM "Users" WHERE email = $1',
// //       [email]
// //     );
// //     if (userResult.rows.length === 0) {
// //       return res.status(401).json({ message: 'Invalid credentials' });
// //     }

// //     const user = userResult.rows[0];
// //     const validPassword = await bcrypt.compare(password, user.password);
// //     if (!validPassword) {
// //       return res.status(401).json({ message: 'Invalid credentials' });
// //     }

// //     // Patch: Attach unit_id for principal/teacher in JWT
// //     const tokenPayload =
// //       (user.role === 'teacher' || user.role === 'principal')
// //         ? { id: user.id, role: user.role, unit_id: user.unit_id }
// //         : { id: user.id, role: user.role };

// //     const token = jwt.sign(
// //       tokenPayload,
// //       process.env.JWT_SECRET,
// //       { expiresIn: '24h' }
// //     );

// //     res.json({ token });
// //   } catch (error) {
// //     console.error('Login error:', error);
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // };
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Get user row
//     const userResult = await pool.query(
//       'SELECT * FROM "Users" WHERE email = $1',
//       [email]
//     );
//     if (userResult.rows.length === 0) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//     const user = userResult.rows[0];

//     // Check password
//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Fetch unit_id for principal or teacher
//     let unit_id;
//     if (user.role === 'principal') {
//       const p = await pool.query('SELECT unit_id FROM principal WHERE user_id = $1', [user.id]);
//       if (p.rowCount) unit_id = p.rows[0].unit_id;
//     } else if (user.role === 'teacher') {
//       const t = await pool.query('SELECT unit_id FROM staff WHERE user_id = $1', [user.id]);
//       if (t.rowCount) unit_id = t.rows[0].unit_id;
//     }

//     // Now put unit_id in tokenPayload for principals and teachers
//     const tokenPayload =
//       (user.role === 'teacher' || user.role === 'principal')
//         ? { id: user.id, role: user.role, unit_id }
//         : { id: user.id, role: user.role };

//     const token = jwt.sign(
//       tokenPayload,
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.json({ token });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// // 📌 VERIFY TOKEN
// exports.verify = async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ error: 'No token provided' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     res.json({ valid: true, user: decoded });
//   } catch (error) {
//     res.status(401).json({ error: 'Invalid token' });
//   }
// };

const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User (leave as before; onboarding sets up principal/staff and their unit_id)
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log('Registration attempt:', { email, role });

    if (!email || !password || !role) {
      return res.status(400).json({
        message: 'Please provide email, password and role'
      });
    }

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM "Users" WHERE email = $1',
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const result = await pool.query(
      'INSERT INTO "Users" (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, role]
    );
    const user = result.rows[0];
    console.log('User created:', user);

    // No unit_id at this stage; onboarding required for principals/teachers
    const tokenPayload = { id: user.id, email: user.email, role: user.role };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    if (role === 'teacher' || role === 'principal') {
      return res.status(201).json({
        token,
        message: 'Registration successful. Please complete your profile.',
        requiresOnboarding: true
      });
    }

    res.status(201).json({ token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Login with role-based unit_id joining principal/staff tables as needed
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user row
    const userResult = await pool.query(
      'SELECT * FROM "Users" WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = userResult.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Fetch unit_id for principal or teacher
    let unit_id;
    if (user.role === 'principal') {
      const p = await pool.query('SELECT unit_id FROM principal WHERE user_id = $1', [user.id]);
      if (p.rowCount) unit_id = p.rows[0].unit_id;
    } else if (user.role === 'teacher') {
      const t = await pool.query('SELECT unit_id FROM staff WHERE user_id = $1', [user.id]);
      if (t.rowCount) unit_id = t.rows[0].unit_id;
    }

    // Now put unit_id in tokenPayload for principals and teachers
    const tokenPayload =
      (user.role === 'teacher' || user.role === 'principal')
        ? { id: user.id, role: user.role, unit_id }
        : { id: user.id, role: user.role };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📌 VERIFY TOKEN
exports.verify = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
