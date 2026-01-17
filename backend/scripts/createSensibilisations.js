const pool = require('../config/database');

const createSensibilisations = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('🎓 Création des sensibilisations pour les 4 premiers adhérents...\n');
    
    // Get the first 4 adherents with their centre info
    const [adherents] = await connection.execute(
      `SELECT a.id, a.raison_sociale, a.dispensaire_id FROM adherents a WHERE a.id <= 4 ORDER BY a.id`
    );
    
    if (adherents.length === 0) {
      console.log('❌ Aucun adhérent trouvé');
      await connection.release();
      process.exit(1);
    }
    
    console.log(`👥 ${adherents.length} adhérents trouvés\n`);
    
    const sensibilisationData = [
      {
        sujet: 'Sensibilisation à la Sécurité Routière',
        description: 'Programme de sensibilisation sur les règles de sécurité routière et la prévention des accidents'
      },
      {
        sujet: 'Sensibilisation à la Protection de l\'Environnement',
        description: 'Awareness program sur la protection environnementale et le développement durable'
      },
      {
        sujet: 'Sensibilisation à l\'Égalité au Travail',
        description: 'Sensibilisation aux droits égaux et à la non-discrimination en milieu professionnel'
      },
      {
        sujet: 'Sensibilisation à la Santé Publique',
        description: 'Programme de sensibilisation aux enjeux de santé publique et prévention sanitaire'
      }
    ];
    
    let count = 0;
    const currentDate = '2024-06-15';
    
    for (const adherent of adherents) {
      // Use the corresponding sensibilisation data (cycling through if needed)
      const sensibilisation = sensibilisationData[(adherent.id - 1) % sensibilisationData.length];
      
      try {
        await connection.execute(
          `INSERT INTO sensibilisations (sujet, description, date, centre_id, adherent_id, is_valid) 
           VALUES (?, ?, ?, ?, ?, true)`,
          [sensibilisation.sujet, sensibilisation.description, currentDate, adherent.dispensaire_id, adherent.id]
        );
        count++;
        console.log(`✅ Sensibilisation créée pour adhérent ${adherent.id}`);
        console.log(`   Sujet: ${sensibilisation.sujet}`);
        console.log(`   Centre: ${adherent.dispensaire_id}\n`);
      } catch (err) {
        console.log(`❌ Erreur adhérent ${adherent.id}: ${err.message}\n`);
      }
    }
    
    console.log(`🎉 ${count} sensibilisations créées avec succès!\n`);
    
    // Display all sensibilisations
    const [sensibilisations] = await connection.execute(
      `SELECT s.id, s.sujet, s.description, s.date, s.adherent_id, c.nom as centre_nom, s.is_valid
       FROM sensibilisations s
       LEFT JOIN centres c ON s.centre_id = c.id
       WHERE s.adherent_id <= 4
       ORDER BY s.adherent_id`
    );
    
    console.log('========================================');
    console.log('📋 SENSIBILISATIONS CRÉÉES:');
    console.log('========================================\n');
    
    let currentAdherent = null;
    sensibilisations.forEach(s => {
      if (s.adherent_id !== currentAdherent) {
        currentAdherent = s.adherent_id;
        console.log(`\n👤 Adhérent ${s.adherent_id}:`);
      }
      console.log(`   📌 ${s.sujet}`);
      console.log(`      Description: ${s.description}`);
      console.log(`      Date: ${s.date} | Centre: ${s.centre_nom} | Statut: ${s.is_valid ? 'Confirmé' : 'Annulé'}`);
    });
    
    console.log('\n');
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

createSensibilisations();
