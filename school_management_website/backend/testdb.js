require('dotenv').config();
const pool = require('./config/db');

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database connected at:', res.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  }
})();
