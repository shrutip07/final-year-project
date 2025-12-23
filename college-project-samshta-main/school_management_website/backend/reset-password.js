require('dotenv').config();
const pool = require('./config/db');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const email = 'sejalsonawane27@gmail.com';
    const newPassword = 'Sejal@123'; // Correct password
    
    console.log(`🔄 Resetting password for ${email}...`);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    const result = await pool.query(
      'UPDATE "Users" SET password = $1 WHERE email = $2 RETURNING id, email',
      [hashedPassword, email]
    );
    
    if (result.rowCount === 0) {
      console.log('❌ User not found');
    } else {
      console.log('✅ Password updated successfully!');
      console.log('User:', result.rows[0]);
      console.log(`\n📝 Password: ${newPassword}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
