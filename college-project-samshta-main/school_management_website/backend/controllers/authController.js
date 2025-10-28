const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
const register = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log('Registration attempt:', { email, role }); // Debug log

        if (!email || !password || !role) {
            return res.status(400).json({ 
                message: 'Please provide email, password and role' 
            });
        }

        // Check if user already exists - note the case sensitivity in table name
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

        // Create new user - note the case sensitivity in table name
        const result = await pool.query(
            'INSERT INTO "Users" (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
            [email, hashedPassword, role]
        );

        const user = result.rows[0];
        console.log('User created:', user); // Debug log

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // If it's a teacher, they need to complete onboarding
        if (role === 'teacher') {
            return res.status(201).json({
                token,
                message: 'Registration successful. Please complete your profile.',
                requiresOnboarding: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            });
        }

        res.status(201).json({ 
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ 
            message: 'Something went wrong',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// 📌 LOGIN USER
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await pool.query(
      'SELECT * FROM "Users" WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
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
const verify = async (req, res) => {
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

// Export all functions consistently
module.exports = {
    login,
    register,
    verify
};
