require('dotenv').config();
const pool = require('./config/db');

(async () => {
  try {
    console.log('Testing getUnits query...\n');
    
    const result = await pool.query(`
      SELECT 
        u.unit_id,
        u.kendrashala_name,
        (SELECT COUNT(DISTINCT staff_id) FROM staff WHERE staff.unit_id = u.unit_id) AS staff_count,
        (SELECT COUNT(DISTINCT student_id) FROM students WHERE students.unit_id = u.unit_id) AS student_count
      FROM unit u
      ORDER BY u.kendrashala_name
    `);
    
    console.log('Query result:');
    console.log(JSON.stringify(result.rows, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
