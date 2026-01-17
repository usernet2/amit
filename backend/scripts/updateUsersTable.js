const pool = require('../config/database');

const updateUsersTable = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔄 Mise à jour de la table users...\n');
    
    // Disable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    
    // Add adherent_id column if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN adherent_id INT
      `);
      console.log('✅ Colonne adherent_id ajoutée');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('ℹ️  Colonne adherent_id existe déjà');
      } else {
        throw err;
      }
    }
    
    // Add foreign key constraint for adherent_id
    try {
      await connection.execute(`
        ALTER TABLE users 
        ADD FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
      `);
      console.log('✅ Contrainte de clé étrangère ajoutée');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('ℹ️  Contrainte de clé étrangère existe déjà');
      } else {
        console.log('ℹ️  Contrainte:', err.message);
      }
    }
    
    // Re-enable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);
    
    console.log('\n🎉 Table users mise à jour avec succès!\n');
    
    // Display new table structure
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME='users' AND TABLE_SCHEMA='amit'
    `);
    
    console.log('📋 Structure actuelle de la table users:');
    console.log('─'.repeat(60));
    columns.forEach(col => {
      console.log(`${col.COLUMN_NAME.padEnd(20)} ${col.COLUMN_TYPE.padEnd(20)} ${col.IS_NULLABLE.padEnd(6)} ${col.COLUMN_KEY}`);
    });
    console.log('');
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

updateUsersTable();
