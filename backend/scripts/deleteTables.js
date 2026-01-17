const pool = require('../config/database');

const deleteTables = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('🗑️  Suppression de toutes les tables...\n');
    
    // Disable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    
    // Drop all tables
    const tables = [
      'sensibilisations',
      'participer',
      'formations',
      'visite_systematique',
      'visite_entreprise',
      'adherants',
      'confirmation_codes',
      'adherents_raw',
      'users',
      'centres'
    ];
    
    for (const table of tables) {
      try {
        await connection.execute(`DROP TABLE IF EXISTS ${table}`);
        console.log(`✅ Table ${table} supprimée`);
      } catch (err) {
        console.log(`⚠️  Table ${table}: ${err.message}`);
      }
    }
    
    // Re-enable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);
    
    console.log(`\n🎉 Toutes les tables ont été supprimées!\n`);
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

deleteTables();
