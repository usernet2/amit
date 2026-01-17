const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const seedCentres = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Read CSV file
    const csvPath = path.join(__dirname, '../../centre.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.trim().split('\n');
    
    // Skip header row
    const centres = lines.slice(1).filter(line => line.trim());
    
    console.log('🌍 Importation des centres depuis CSV...\n');
    
    let count = 0;
    
    for (const line of centres) {
      const parts = line.split(';');
      if (parts.length >= 2) {
        const centreId = parseInt(parts[0].trim());
        const nomCentre = parts[1].trim();
        
        if (!nomCentre) continue;
        
        try {
          await connection.execute(
            `INSERT INTO centres (id, nom) 
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE nom = VALUES(nom)`,
            [centreId, nomCentre]
          );
          count++;
          console.log(`✅ Centre ${centreId}: ${nomCentre}`);
        } catch (err) {
          console.log(`⚠️  Centre ${centreId} (${nomCentre}): ${err.message}`);
        }
      }
    }
    
    console.log(`\n🎉 Import terminé! ${count} centres importés avec succès.\n`);
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error.message);
    process.exit(1);
  }
};

seedCentres();
