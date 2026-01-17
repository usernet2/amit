const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const importAdherentsFromCSV = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('📥 Import des adhérents depuis adherent avec colonne.csv...\n');
    
    // Disable foreign key checks to avoid constraint issues during import
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    
    // Read CSV file
    const csvPath = path.join(__dirname, '../../adherent avec colonne.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.trim().split('\n');
    
    let count = 0;
    let errors = 0;
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Remove quotes and split
      const parts = line.split(';').map(p => p.replace(/^"|"$/g, '').trim());
      
      if (parts.length >= 11 && parts[0]) {
        const id = parseInt(parts[0]);
        const dispensaireId = parseInt(parts[2]);
        const adresse = parts[4] || null;
        const dateAdhesion = parts[5] || null;
        const suspendu = parseInt(parts[6]) || 0;
        const email = parts[7] || null;
        const tel = parts[8] || null;
        
        // Skip if no address or invalid data
        if (!id || !dispensaireId || !adresse) {
          errors++;
          continue;
        }
        
        try {
          // Clean up dates
          let cleanDate = null;
          if (dateAdhesion && dateAdhesion !== '0000-00-00' && dateAdhesion !== '0000-00-00 00:00:00') {
            cleanDate = dateAdhesion.split(' ')[0]; // Get just the date part
          }
          
          await connection.execute(
            `INSERT INTO adherents (id, raison_sociale, siege, contact, email, adresse, date_adhesion, tel, dispensaire_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE email = VALUES(email), tel = VALUES(tel), date_adhesion = VALUES(date_adhesion)`,
            [id, `Entreprise ${id}`, adresse, null, email, adresse, cleanDate, tel, dispensaireId]
          );
          count++;
          
          if (count % 100 === 0 || count <= 5) {
            console.log(`✅ ${count} adhérents importés... (ID: ${id})`);
          }
        } catch (err) {
          errors++;
          if (errors <= 5) {
            console.log(`⚠️  Erreur avec adhérent ${id}: ${err.message}`);
          }
        }
      }
    }
    
    // Re-enable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);
    
    console.log(`\n🎉 Import terminé!`);
    console.log(`✅ ${count} adhérents importés avec succès`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} erreurs/lignes vides`);
    }
    console.log('');
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

importAdherentsFromCSV();
