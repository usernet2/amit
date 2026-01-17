const pool = require('../config/database');

(async () => {
  try {
    const conn = await pool.getConnection();
    const [users] = await conn.execute('SELECT id, email, role FROM users ORDER BY id');
    
    console.log('\n📋 Users in Database:\n');
    users.forEach(u => {
      const roleEmoji = u.role === 'admin' ? '👨‍💼' : u.role === 'medecin_chef' ? '🩺' : '🏭';
      console.log(`   ${u.id}. ${roleEmoji} ${u.email} (${u.role})`);
    });
    
    console.log(`\n✅ Total Users: ${users.length}\n`);
    
    conn.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
