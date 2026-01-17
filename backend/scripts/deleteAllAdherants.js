const pool = require('../config/database');

const deleteAllAdherants = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('🗑️  Suppression de tous les adhérents...\n');
    
    // Disable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    
    // Delete all records from adherants
    const [result] = await connection.execute(`DELETE FROM adherants`);
    
    // Re-enable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);
    
    console.log(`✅ ${result.affectedRows} adhérents supprimés avec succès!\n`);
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

deleteAllAdherants();
