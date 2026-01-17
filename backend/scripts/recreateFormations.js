const pool = require('../config/database');

const recreateFormations = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Disable foreign key checks temporarily
    await connection.execute(`SET FOREIGN_KEY_CHECKS=0`);
    console.log('✓ Foreign key checks désactivées');
    
    // Drop tables in correct order
    await connection.execute(`DROP TABLE IF EXISTS participer`);
    console.log('✓ Table participer supprimée');
    
    await connection.execute(`DROP TABLE IF EXISTS formations`);
    console.log('✓ Table formations supprimée');
    
    // Create new formations table with UNIQUE constraint on designation
    await connection.execute(`
      CREATE TABLE formations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        designation VARCHAR(150) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Table formations recréée avec designation UNIQUE');
    
    // Recreate participer table
    await connection.execute(`
      CREATE TABLE participer (
        id INT AUTO_INCREMENT PRIMARY KEY,
        formation_id INT NOT NULL,
        adherant_id INT NOT NULL,
        date_deb DATE NOT NULL,
        date_fin DATE NOT NULL,
        is_valid BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_participation (formation_id, adherant_id)
      )
    `);
    console.log('✓ Table participer recréée sans foreign keys');
    
    // Re-enable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS=1`);
    console.log('✓ Foreign key checks réactivées');
    
    connection.release();
    console.log('✅ Recréation réussie! Tables formations et participer sont prêtes.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

recreateFormations();
