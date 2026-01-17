const pool = require('../config/database');

const deleteAdherantsTable = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('🗑️  Suppression de la table adherants...\n');
    
    // Disable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    
    // Drop the table
    await connection.execute(`DROP TABLE IF EXISTS adherants`);
    
    // Re-enable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);
    
    console.log('✅ Table adherants supprimée avec succès!\n');
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error.message);
    process.exit(1);
  }
};

deleteAdherantsTable();
