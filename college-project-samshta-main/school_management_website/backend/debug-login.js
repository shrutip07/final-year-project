require('dotenv').config();
const pool = require('./config/db');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    console.log('🔍 Testing login flow...\n');
    
    const email = 'sejalsonawane27@gmail.com';
    
    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM "Users" WHERE email = $1',
      [email]
    );
    
    console.log('User query result:', {
      rowCount: userResult.rowCount,
      rows: userResult.rows
    });
    
    if (userResult.rowCount === 0) {
      console.log('❌ User NOT found in database');
      
      // List all users
      const allUsers = await pool.query('SELECT id, email, role FROM "Users"');
      console.log('\n📋 All users in database:');
      console.log(allUsers.rows);
    } else {
      const user = userResult.rows[0];
      console.log('\n✅ User found:');
      console.log('  ID:', user.id);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  Password hash exists:', !!user.password);
      
      // Test password
      const testPassword = 'test123'; // adjust as needed
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`\n🔐 Test password "${testPassword}" valid:`, isValid);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
