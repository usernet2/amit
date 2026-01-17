const pool = require('../config/database');

const createParticipations = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('📝 Création des participations aux formations...\n');
    
    // Get the first 4 adherents
    const [adherents] = await connection.execute(
      `SELECT id FROM adherents WHERE id <= 4 ORDER BY id`
    );
    
    // Get all formations
    const [formations] = await connection.execute(
      `SELECT id FROM formations ORDER BY id`
    );
    
    if (adherents.length === 0 || formations.length === 0) {
      console.log('❌ Aucun adhérent ou formation trouvé');
      await connection.release();
      process.exit(1);
    }
    
    console.log(`👥 ${adherents.length} adhérents trouvés`);
    console.log(`📚 ${formations.length} formations trouvées\n`);
    
    let count = 0;
    const startDate = '2024-01-15';
    const endDate = '2024-03-15';
    
    // Create participation for each adherent in each formation
    for (const adherent of adherents) {
      for (const formation of formations) {
        try {
          await connection.execute(
            `INSERT INTO participer (formation_id, adherent_id, date_deb, date_fin, is_valid) 
             VALUES (?, ?, ?, ?, true)`,
            [formation.id, adherent.id, startDate, endDate]
          );
          count++;
          console.log(`✅ Adhérent ${adherent.id} inscrit à Formation ${formation.id}`);
        } catch (err) {
          if (err.message.includes('Duplicate entry')) {
            console.log(`⚠️  Adhérent ${adherent.id} déjà inscrit à Formation ${formation.id}`);
          } else {
            console.log(`❌ Erreur: ${err.message}`);
          }
        }
      }
    }
    
    console.log(`\n🎉 ${count} participations créées avec succès!\n`);
    
    // Display all participations
    const [participations] = await connection.execute(
      `SELECT p.id, p.adherent_id, p.formation_id, f.designation, p.date_deb, p.date_fin, p.is_valid
       FROM participer p
       JOIN formations f ON p.formation_id = f.id
       WHERE p.adherent_id <= 4
       ORDER BY p.adherent_id, p.formation_id`
    );
    
    console.log('========================================');
    console.log('📋 PARTICIPATIONS AUX FORMATIONS:');
    console.log('========================================\n');
    
    let currentAdherent = null;
    participations.forEach(p => {
      if (p.adherent_id !== currentAdherent) {
        currentAdherent = p.adherent_id;
        console.log(`\n👤 Adhérent ${p.adherent_id}:`);
      }
      console.log(`   ✓ ${p.designation}`);
      console.log(`     Du ${p.date_deb} au ${p.date_fin} (${p.is_valid ? 'Confirmé' : 'Annulé'})`);
    });
    
    console.log('\n');
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

createParticipations();
