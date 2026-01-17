const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

(async () => {
  const conn = await pool.getConnection();
  try {
    // Ajouter la colonne adhérant_id à sensibilisations
    await conn.execute(`
      ALTER TABLE sensibilisations 
      ADD COLUMN adherant_id INT UNSIGNED,
      ADD FOREIGN KEY (adherant_id) REFERENCES adherants(id) ON DELETE CASCADE
    `);
    console.log('✅ Colonne adherant_id ajoutée à sensibilisations');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Colonne adherant_id existe déjà');
    } else {
      console.error('Erreur:', err.message);
    }
  } finally {
    conn.release();
    await pool.end();
    process.exit(0);
  }
})();
