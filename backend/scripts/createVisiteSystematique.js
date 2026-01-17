const pool = require('../config/database');

const createVisiteSystematique = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('🏭 Création des visites systématiques pour les 4 premiers adhérents...\n');
    
    // Get the first 4 adherents
    const [adherents] = await connection.execute(
      `SELECT id, raison_sociale FROM adherents WHERE id <= 4 ORDER BY id`
    );
    
    if (adherents.length === 0) {
      console.log('❌ Aucun adhérent trouvé');
      await connection.release();
      process.exit(1);
    }
    
    console.log(`👥 ${adherents.length} adhérents trouvés\n`);
    
    let count = 0;
    
    for (const adherent of adherents) {
      const startDate = '2024-04-01';
      const endDate = '2024-05-31';
      
      try {
        await connection.execute(
          `INSERT INTO visite_systematique (date_deb, date_fin, adherent_id, is_valid, observations) 
           VALUES (?, ?, ?, true, ?)`,
          [startDate, endDate, adherent.id, `Visite systématique pour ${adherent.raison_sociale}`]
        );
        count++;
        console.log(`✅ Visite systématique créée pour adhérent ${adherent.id}`);
        console.log(`   Entreprise: ${adherent.raison_sociale}`);
        console.log(`   Période: ${startDate} à ${endDate}\n`);
      } catch (err) {
        console.log(`❌ Erreur adhérent ${adherent.id}: ${err.message}\n`);
      }
    }
    
    console.log(`🎉 ${count} visites systématiques créées avec succès!\n`);
    
    // Display all visites
    const [visites] = await connection.execute(
      `SELECT vs.id, vs.date_deb, vs.date_fin, vs.adherent_id, vs.observations, vs.is_valid, a.raison_sociale
       FROM visite_systematique vs
       JOIN adherents a ON vs.adherent_id = a.id
       WHERE vs.adherent_id <= 4
       ORDER BY vs.adherent_id`
    );
    
    console.log('========================================');
    console.log('📋 VISITES SYSTÉMATIQUES CRÉÉES:');
    console.log('========================================\n');
    
    visites.forEach(v => {
      console.log(`🏭 Visite ID ${v.id}`);
      console.log(`   Adhérent: ${v.adherent_id} - ${v.raison_sociale}`);
      console.log(`   Date début: ${v.date_deb}`);
      console.log(`   Date fin: ${v.date_fin}`);
      console.log(`   Observations: ${v.observations}`);
      console.log(`   Statut: ${v.is_valid ? 'Confirmé' : 'Annulé'}\n`);
    });
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

createVisiteSystematique();
