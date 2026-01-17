const pool = require('../config/database');

const createVisiteEntreprise = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('🏢 Création des visites d\'entreprise pour les 4 premiers adhérents...\n');
    
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
    
    // Different dates for visite_entreprise
    const visiteDates = [
      { date: '2024-02-15 10:30:00', adherent: 1 },
      { date: '2024-03-20 14:00:00', adherent: 2 },
      { date: '2024-03-10 09:15:00', adherent: 3 },
      { date: '2024-02-28 11:45:00', adherent: 4 }
    ];
    
    for (const visite of visiteDates) {
      const adherent = adherents.find(a => a.id === visite.adherent);
      if (!adherent) continue;
      
      try {
        await connection.execute(
          `INSERT INTO visite_entreprise (date_heure, adherent_id, is_valid, observations) 
           VALUES (?, ?, true, ?)`,
          [visite.date, visite.adherent, `Visite d'entreprise pour ${adherent.raison_sociale}`]
        );
        count++;
        console.log(`✅ Visite d'entreprise créée pour adhérent ${visite.adherent}`);
        console.log(`   Entreprise: ${adherent.raison_sociale}`);
        console.log(`   Date/Heure: ${visite.date}\n`);
      } catch (err) {
        console.log(`❌ Erreur adhérent ${visite.adherent}: ${err.message}\n`);
      }
    }
    
    console.log(`🎉 ${count} visites d'entreprise créées avec succès!\n`);
    
    // Display all visites
    const [visites] = await connection.execute(
      `SELECT ve.id, ve.date_heure, ve.adherent_id, ve.observations, ve.is_valid, a.raison_sociale
       FROM visite_entreprise ve
       JOIN adherents a ON ve.adherent_id = a.id
       WHERE ve.adherent_id <= 4
       ORDER BY ve.adherent_id`
    );
    
    console.log('========================================');
    console.log('📋 VISITES D\'ENTREPRISE CRÉÉES:');
    console.log('========================================\n');
    
    visites.forEach(v => {
      console.log(`🏢 Visite ID ${v.id}`);
      console.log(`   Adhérent: ${v.adherent_id} - ${v.raison_sociale}`);
      console.log(`   Date/Heure: ${v.date_heure}`);
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

createVisiteEntreprise();
