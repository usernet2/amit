const pool = require('../config/database');
const bcrypt = require('bcrypt');

const createAdminUser = async () => {
  try {
    const connection = await pool.getConnection();
    
    const email = 'admin@amit.com';
    const password = 'Admin@123';
    const role = 'admin';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if admin already exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      console.log('❌ Admin user already exists');
      connection.release();
      process.exit(0);
    }
    
    // For admin/medecin_chef, we need to use adherent_id = 1 as a placeholder (won't actually use it)
    // Admin users don't belong to a specific adherent
    await connection.execute(
      'INSERT INTO users (email, password, role, adherent_id) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, role, 1]
    );
    
    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    
    connection.release();
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
};

createAdminUser();
