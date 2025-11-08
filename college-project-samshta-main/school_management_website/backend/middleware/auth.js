

// module.exports = { authenticateToken, authorizeRoles };
const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access Denied' });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };

// const jwt = require('jsonwebtoken');
// const pool = require('../config/db');
// require('dotenv').config();

// async function authenticateToken(req, res, next) {
//   const token = req.headers['authorization']?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'Token missing' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (decoded.role === "principal") {
//       // Attach unit_id as school_id for principal
//       const result = await pool.query(
//         "SELECT unit_id FROM principals WHERE id = $1",
//         [decoded.id]
//       );
//       if (result.rowCount === 0) {
//         return res.status(403).json({ message: "Principal not found in DB." });
//       }
//       req.user = { ...decoded, school_id: result.rows[0].unit_id };
//     } else if (decoded.role === "teacher") {
//       const result = await pool.query(
//         "SELECT unit_id FROM teachers WHERE id = $1",
//         [decoded.id]
//       );
//       if (result.rowCount === 0) {
//         return res.status(403).json({ message: "Teacher not found in DB." });
//       }
//       req.user = { ...decoded, school_id: result.rows[0].unit_id };
//     } else {
//       // Set as is for admin/other roles
//       req.user = decoded;
//     }
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: 'Invalid token' });
//   }
// }

// function authorizeRoles(...roles) {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Access Denied' });
//     }
//     next();
//   };
// }

// module.exports = { authenticateToken, authorizeRoles };
