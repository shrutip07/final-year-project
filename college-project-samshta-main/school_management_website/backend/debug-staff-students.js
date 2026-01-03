require('dotenv').config();
const pool = require('./config/db');

(async () => {
  try {
    console.log('📊 Checking Staff and Students Data\n');
    
    // Check staff table structure and count
    const staffColumns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'staff'
      ORDER BY ordinal_position
    `);
    
    console.log('Staff table columns:');
    staffColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Count total staff
    const staffCount = await pool.query('SELECT COUNT(*) as count FROM staff');
    console.log(`\n👥 Total staff records: ${staffCount.rows[0].count}`);
    
    // Show sample staff records
    const staffSample = await pool.query('SELECT staff_id, full_name, unit_id, staff_type FROM staff LIMIT 5');
    console.log('\nSample staff records:');
    staffSample.rows.forEach(s => {
      console.log(`  - ID: ${s.staff_id}, Name: ${s.full_name}, Unit: ${s.unit_id}, Type: ${s.staff_type}`);
    });
    
    // Check students table
    console.log('\n' + '='.repeat(50));
    const studentColumns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'students'
      ORDER BY ordinal_position
    `);
    
    console.log('\nStudents table columns:');
    studentColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Count total students
    const studentCount = await pool.query('SELECT COUNT(*) as count FROM students');
    console.log(`\n👨‍🎓 Total student records: ${studentCount.rows[0].count}`);
    
    // Show sample student records
    const studentSample = await pool.query('SELECT student_id, full_name, unit_id FROM students LIMIT 5');
    console.log('\nSample student records:');
    studentSample.rows.forEach(s => {
      console.log(`  - ID: ${s.student_id}, Name: ${s.full_name}, Unit: ${s.unit_id}`);
    });
    
    // Check unit table
    console.log('\n' + '='.repeat(50));
    const unitCount = await pool.query('SELECT COUNT(*) as count FROM unit');
    console.log(`\n🏫 Total units: ${unitCount.rows[0].count}`);
    
    const unitSample = await pool.query('SELECT unit_id, kendrashala_name FROM unit LIMIT 5');
    console.log('\nSample units:');
    unitSample.rows.forEach(u => {
      console.log(`  - Unit ${u.unit_id}: ${u.kendrashala_name}`);
    });
    
    // Check staff count by unit
    console.log('\n' + '='.repeat(50));
    console.log('\nStaff count per unit:');
    const staffByUnit = await pool.query(`
      SELECT unit_id, COUNT(*) as staff_count
      FROM staff
      GROUP BY unit_id
      ORDER BY unit_id
    `);
    staffByUnit.rows.forEach(row => {
      console.log(`  - Unit ${row.unit_id}: ${row.staff_count} staff`);
    });
    
    // Check students count by unit
    console.log('\nStudent count per unit:');
    const studentByUnit = await pool.query(`
      SELECT unit_id, COUNT(*) as student_count
      FROM students
      GROUP BY unit_id
      ORDER BY unit_id
    `);
    studentByUnit.rows.forEach(row => {
      console.log(`  - Unit ${row.unit_id}: ${row.student_count} students`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
