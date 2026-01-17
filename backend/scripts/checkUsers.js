const pool = require('../config/database');

const checkUsers = async () => {
  try {
    const conn = await pool.getConnection();
    const [users] = await conn.execute('SELECT id, email, role, adherent_id FROM users WHERE adherent_id IS NOT NULL');
    console.log('Users with adherent_id:');
    users.forEach(u => {
      console.log(`  ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Adherent: ${u.adherent_id}`);
    });
    await conn.release();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
};

checkUsers();
