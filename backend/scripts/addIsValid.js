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
    // Ajouter is_valid aux tables (ou le modifier s'il existe)
    await conn.execute(`
      ALTER TABLE visite_entreprise 
      DROP COLUMN IF EXISTS status,
      ADD COLUMN is_valid BOOLEAN DEFAULT true
    `);
    console.log('✅ visite_entreprise: colonne is_valid ajoutée');

    await conn.execute(`
      ALTER TABLE visite_systematique 
      DROP COLUMN IF EXISTS status,
      ADD COLUMN is_valid BOOLEAN DEFAULT true
    `);
    console.log('✅ visite_systematique: colonne is_valid ajoutée');

    await conn.execute(`
      ALTER TABLE participer 
      DROP COLUMN IF EXISTS status,
      ADD COLUMN is_valid BOOLEAN DEFAULT true
    `);
    console.log('✅ participer: colonne is_valid ajoutée');

    await conn.execute(`
      ALTER TABLE sensibilisations 
      DROP COLUMN IF EXISTS status,
      ADD COLUMN is_valid BOOLEAN DEFAULT true
    `);
    console.log('✅ sensibilisations: colonne is_valid ajoutée');
  } catch (err) {
    console.error('Erreur:', err.message);
  } finally {
    conn.release();
    await pool.end();
    process.exit(0);
  }
})();
