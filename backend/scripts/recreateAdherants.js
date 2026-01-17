const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const recreateAdherants = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔄 Recréation de la table adherants...\n');
    
    // Disable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    
    // Drop dependent tables first
    await connection.execute(`DROP TABLE IF EXISTS sensibilisations`);
    await connection.execute(`DROP TABLE IF EXISTS visite_systematique`);
    await connection.execute(`DROP TABLE IF EXISTS visite_entreprise`);
    await connection.execute(`DROP TABLE IF EXISTS participer`);
    await connection.execute(`DROP TABLE IF EXISTS adherants`);
    
    // Create Adherants table
    await connection.execute(`
      CREATE TABLE adherants (
        id INT PRIMARY KEY,
        raison_sociale VARCHAR(255),
        siege VARCHAR(255),
        contact VARCHAR(20),
        email VARCHAR(100),
        adresse VARCHAR(255),
        date_adhesion DATE,
        tel VARCHAR(30),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Table adherants créée\n');
    
    // Read and import CSV data
    const csvPath = path.join(__dirname, '../../adherent.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.trim().split('\n');
    
    // Skip header row
    const adherents = lines.slice(1).filter(line => line.trim() && line.split(';')[0]);
    
    console.log(`📥 Import de ${adherents.length} adhérents depuis CSV...\n`);
    
    let count = 0;
    
    for (const line of adherents) {
      const parts = line.split(';');
      if (parts.length >= 8 && parts[0].trim()) {
        const id = parseInt(parts[0].trim());
        const adresse = parts[4]?.trim() || null;
        const dateAdhesion = parts[5]?.trim() || null;
        const email = parts[7]?.trim() || null;
        const tel = parts[8]?.trim() || null;
        
        // Skip empty rows
        if (!id || !adresse) continue;
        
        try {
          await connection.execute(
            `INSERT INTO adherants (id, raison_sociale, siege, contact, email, adresse, date_adhesion, tel) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, `Entreprise ${id}`, adresse, null, email, adresse, dateAdhesion || null, tel]
          );
          count++;
          if (count <= 5 || count % 500 === 0) {
            console.log(`✅ Adhérent ${id}: ${adresse}`);
          }
        } catch (err) {
          // Silently skip duplicates or errors
        }
      }
    }
    
    // Re-enable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);
    
    console.log(`\n🎉 Recréation terminée! ${count} adhérents importés.\n`);
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

recreateAdherants();
