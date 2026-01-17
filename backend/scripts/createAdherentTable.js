const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const createAdherentTable = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('📋 Création des tables centres et adherents...\n');
    
    // Create Centres table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS centres (
        id INT PRIMARY KEY,
        nom VARCHAR(150) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table centres créée');
    
    // Import centres from CSV
    const centreCsvPath = path.join(__dirname, '../../centre.csv');
    const centreCsvData = fs.readFileSync(centreCsvPath, 'utf-8');
    const centreLines = centreCsvData.trim().split('\n');
    
    console.log('\n📥 Import des centres...');
    let centreCount = 0;
    
    for (let i = 1; i < centreLines.length; i++) {
      const line = centreLines[i].trim();
      if (!line) continue;
      
      const parts = line.split(';');
      if (parts.length >= 2) {
        const centreId = parseInt(parts[0].trim());
        const nomCentre = parts[1].trim();
        
        if (centreId && nomCentre) {
          await connection.execute(
            `INSERT INTO centres (id, nom) VALUES (?, ?)`,
            [centreId, nomCentre]
          );
          centreCount++;
        }
      }
    }
    console.log(`✅ ${centreCount} centres importés`);
    
    // Create Adherents table with dispensaire_id as foreign key
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS adherents (
        id INT PRIMARY KEY,
        raison_sociale VARCHAR(255),
        siege VARCHAR(255),
        contact VARCHAR(20),
        email VARCHAR(100),
        adresse VARCHAR(255),
        date_adhesion DATE,
        tel VARCHAR(30),
        dispensaire_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (dispensaire_id) REFERENCES centres(id) ON DELETE RESTRICT
      )
    `);
    console.log('\n✅ Table adherents créée avec contrainte de clé étrangère');
    
    // Import adherents from CSV
    const adherentCsvPath = path.join(__dirname, '../../adherent.csv');
    const adherentCsvData = fs.readFileSync(adherentCsvPath, 'utf-8');
    const adherentLines = adherentCsvData.trim().split('\n');
    
    console.log('\n📥 Import des adhérents...');
    let adherentCount = 0;
    
    for (let i = 1; i < adherentLines.length; i++) {
      const line = adherentLines[i].trim();
      if (!line || !line.split(';')[0].trim()) continue;
      
      const parts = line.split(';');
      if (parts.length >= 9) {
        const id = parseInt(parts[0].trim());
        const dispensaireId = parseInt(parts[2].trim());
        const adresse = parts[4]?.trim() || null;
        const dateAdhesion = parts[5]?.trim() || null;
        const email = parts[7]?.trim() || null;
        const tel = parts[8]?.trim() || null;
        
        if (id && dispensaireId && adresse) {
          try {
            await connection.execute(
              `INSERT INTO adherents (id, raison_sociale, siege, contact, email, adresse, date_adhesion, tel, dispensaire_id) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [id, `Entreprise ${id}`, adresse, null, email, adresse, dateAdhesion || null, tel, dispensaireId]
            );
            adherentCount++;
            if (adherentCount <= 5 || adherentCount % 500 === 0) {
              console.log(`✅ Adhérent ${id}: ${adresse} -> Dispensaire ${dispensaireId}`);
            }
          } catch (err) {
            // Silently skip duplicates or errors
          }
        }
      }
    }
    console.log(`\n✅ ${adherentCount} adhérents importés`);
    
    console.log(`\n🎉 Tables créées avec succès!\n`);
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

createAdherentTable();
