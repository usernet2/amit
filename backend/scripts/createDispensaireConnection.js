const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const createDispensaireConnection = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔗 Création de la connexion dispensaire_id -> centre_id...\n');
    
    // Disable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    
    // Add dispensaire_id column to adherants if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE adherants 
        ADD COLUMN dispensaire_id INT DEFAULT 1
      `);
      console.log('✅ Colonne dispensaire_id ajoutée');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('ℹ️  Colonne dispensaire_id existe déjà');
      } else {
        throw err;
      }
    }
    
    // Read and update dispensaire_id from CSV
    const csvPath = path.join(__dirname, '../../adherent.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.trim().split('\n');
    
    console.log('\n📥 Mise à jour des dispensaire_id depuis CSV...\n');
    
    let count = 0;
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(';');
      if (parts.length >= 3) {
        const adherentId = parseInt(parts[0].trim());
        const dispensaireId = parseInt(parts[2].trim());
        
        if (adherentId && dispensaireId) {
          try {
            await connection.execute(
              `UPDATE adherants SET dispensaire_id = ? WHERE id = ?`,
              [dispensaireId, adherentId]
            );
            count++;
            console.log(`✅ Adhérent ${adherentId}: dispensaire_id = ${dispensaireId}`);
          } catch (err) {
            console.log(`⚠️  Adhérent ${adherentId}: ${err.message}`);
          }
        }
      }
    }
    
    // Add foreign key constraint
    try {
      await connection.execute(`
        ALTER TABLE adherants 
        ADD FOREIGN KEY (dispensaire_id) REFERENCES centres(id)
      `);
      console.log('\n✅ Contrainte de clé étrangère ajoutée');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('\nℹ️  Contrainte de clé étrangère existe déjà');
      } else {
        console.log('\nℹ️  Contrainte de clé étrangère:', err.message);
      }
    }
    
    // Re-enable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);
    
    console.log(`\n🎉 Connexion créée avec succès! ${count} adhérents liés à leurs dispensaires.\n`);
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

createDispensaireConnection();
