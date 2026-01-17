const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const seedCentres = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS=0');
    
    // Read the CSV file
    const csvPath = path.join(__dirname, '../../centre.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.trim().split('\n');
    
    // Skip header and empty lines
    const centres = lines.slice(1).filter(line => line.trim()).map(line => {
      const [centre_id, nom] = line.split(';');
      return {
        id: parseInt(centre_id),
        nom: nom.trim()
      };
    });
    
    console.log('📍 Importing centres from CSV...');
    
    // Clear existing centres
    await connection.execute('DELETE FROM centres');
    
    // Insert centres
    for (const centre of centres) {
      await connection.execute(
        'INSERT INTO centres (id, nom) VALUES (?, ?)',
        [centre.id, centre.nom]
      );
    }
    
    console.log(`✅ ${centres.length} centres imported successfully!\n`);
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS=1');
    
    // Display the centres
    const [rows] = await connection.execute('SELECT * FROM centres ORDER BY id');
    console.log('📊 Centres in database:');
    rows.forEach(row => {
      console.log(`   ${row.id}. ${row.nom}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error seeding centres:', error.message);
    process.exit(1);
  }
};

seedCentres();
