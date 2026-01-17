const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const seedAdherents = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Read CSV file
    const csvPath = path.join(__dirname, '../../adherent.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.trim().split('\n');
    
    // Skip header row
    const adherents = lines.slice(1).filter(line => line.trim() && line.split(';')[0]);
    
    console.log('👥 Importation des adhérents depuis CSV...\n');
    
    let count = 0;
    
    for (const line of adherents) {
      const parts = line.split(';');
      if (parts.length >= 8) {
        const adherentId = parseInt(parts[0].trim());
        const adresse = parts[4]?.trim() || null;
        const dateAdhesion = parts[5]?.trim() || null;
        const email = parts[7]?.trim() || null;
        const tel = parts[8]?.trim() || null;
        
        // Skip empty rows
        if (!adherentId || !adresse) continue;
        
        try {
          await connection.execute(
            `INSERT INTO adherents_raw (id, adresse, date_adhesion, email, tel) 
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE adresse = VALUES(adresse), email = VALUES(email), tel = VALUES(tel)`,
            [adherentId, adresse, dateAdhesion || null, email, tel]
          );
          count++;
          if (count <= 10 || count % 100 === 0) {
            console.log(`✅ Adhérent ${adherentId}: ${adresse}`);
          }
        } catch (err) {
          console.log(`⚠️  Adhérent ${adherentId}: ${err.message}`);
        }
      }
    }
    
    console.log(`\n🎉 Import terminé! ${count} adhérents importés avec succès.\n`);
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error.message);
    process.exit(1);
  }
};

seedAdherents();
