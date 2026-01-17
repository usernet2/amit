const pool = require('../config/database');

const checkSchema = async () => {
  try {
    const conn = await pool.getConnection();
    const [cols] = await conn.execute('DESCRIBE users');
    console.log('Users table structure:');
    cols.forEach(c => {
      console.log(`  ${c.Field}: ${c.Type} (Null: ${c.Null}, Key: ${c.Key})`);
    });
    conn.release();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
};

checkSchema();
