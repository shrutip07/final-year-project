require('dotenv').config();
const pool = require('./config/db');

(async () => {
  try {
    console.log('📊 Database Schema Check\n');
    
    // Check Users table structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    tableInfo.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
    });
    
    // Count users
    const userCount = await pool.query('SELECT COUNT(*) as count FROM "Users"');
    console.log(`\n👥 Total users: ${userCount.rows[0].count}`);
    
    // List all users
    const users = await pool.query('SELECT id, email, role FROM "Users"');
    console.log('\n📋 Users:');
    users.rows.forEach(u => {
      console.log(`  - ${u.email} (${u.role})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
