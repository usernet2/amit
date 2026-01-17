const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
});

const bcrypt = require('bcryptjs');

async function seedDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log('🌱 Démarrage du seed des données...\n');

    // ===== CENTRES =====
    console.log('📍 Ajout des centres...');
    const centres = [
      { nom: 'Centre Nord', region: 'Alger' },
      { nom: 'Centre Sud', region: 'Oran' },
      { nom: 'Centre Est', region: 'Constantine' },
    ];

    for (const centre of centres) {
      await connection.execute(
        'INSERT IGNORE INTO centres (nom, region) VALUES (?, ?)',
        [centre.nom, centre.region]
      );
    }
    console.log('✅ Centres ajoutés\n');

    // Get centre IDs
    const [centresData] = await connection.execute('SELECT id FROM centres LIMIT 3');
    const centreIds = centresData.map(c => c.id);

    // ===== USERS & ADMIN =====
    console.log('👤 Ajout des utilisateurs admin...');
    const adminEmail = 'admin@amit.com';
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    
    await connection.execute(
      'INSERT IGNORE INTO users (email, password, role, centre_id) VALUES (?, ?, ?, ?)',
      [adminEmail, adminPassword, 'admin', centreIds[0]]
    );
    console.log('✅ Admin ajouté (email: admin@amit.com, password: Admin@123)\n');

    // ===== USERS & MÉDECIN CHEF =====
    console.log('👨‍⚕️ Ajout des médecins chefs...');
    const medecinChefs = [
      { email: 'medecin-nord@amit.com', name: 'Dr. Hassan Mohamed', centre: centreIds[0] },
      { email: 'medecin-sud@amit.com', name: 'Dr. Leila Ahmed', centre: centreIds[1] },
    ];

    for (const medecin of medecinChefs) {
      const hashedPassword = await bcrypt.hash('Medecin@123', 10);
      await connection.execute(
        'INSERT IGNORE INTO users (email, password, role, centre_id) VALUES (?, ?, ?, ?)',
        [medecin.email, hashedPassword, 'medecin_chef', medecin.centre]
      );
    }
    console.log('✅ Médecins chefs ajoutés\n');
    console.log('   - medecin-nord@amit.com / Medecin@123');
    console.log('   - medecin-sud@amit.com / Medecin@123\n');

    // ===== ADHÉRANTS (Entreprises) =====
    console.log('🏢 Ajout des adhérants (entreprises)...');
    const adherants = [
      {
        raison_sociale: 'Entreprise Technologie SARL',
        siege: '123 Rue de la Liberté, Alger',
        contact: 'contact@tech-sarl.com',
        email: 'user1@gmail.com',
        telephone: '+213 21 123 4567',
        centre_id: centreIds[0],
      },
      {
        raison_sociale: 'Industries Manufacturières LTÉE',
        siege: '456 Avenue des Industries, Oran',
        contact: 'info@industries-mfg.com',
        email: 'user2@gmail.com',
        telephone: '+213 41 234 5678',
        centre_id: centreIds[1],
      },
      {
        raison_sociale: 'Services Commerciaux EIRL',
        siege: '789 Boulevard Commercial, Constantine',
        contact: 'support@services-comm.com',
        email: 'user3@gmail.com',
        telephone: '+213 31 345 6789',
        centre_id: centreIds[2],
      },
    ];

    const adherantIds = [];
    for (const adherant of adherants) {
      const hashedPassword = await bcrypt.hash('Adherant@123', 10);
      
      // Create user
      const [userResult] = await connection.execute(
        'INSERT IGNORE INTO users (email, password, role, centre_id) VALUES (?, ?, ?, ?)',
        [adherant.email, hashedPassword, 'adherant', adherant.centre_id]
      );

      const userId = userResult.insertId || (await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [adherant.email]
      ))[0][0].id;

      // Create adherant
      const [adherantResult] = await connection.execute(
        `INSERT IGNORE INTO adherants (raison_sociale, siege, contact, email, user_id, centre_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [adherant.raison_sociale, adherant.siege, adherant.contact, adherant.telephone, userId, adherant.centre_id]
      );

      const adherantId = adherantResult.insertId || (await connection.execute(
        'SELECT id FROM adherants WHERE email = ?',
        [adherant.telephone]
      ))[0][0].id;

      adherantIds.push(adherantId);
    }
    console.log('✅ Adhérants ajoutés\n');
    console.log('   Credentials:');
    adherants.forEach((a, i) => {
      console.log(`   - ${a.email} / Adherant@123 (${a.raison_sociale})`);
    });
    console.log();

    // ===== FORMATIONS =====
    console.log('📚 Ajout des formations...');
    const formations = [
      {
        designation: 'Hygiène et Sécurité au Travail',
        description: 'Formation sur les normes d\'hygiène et de sécurité en milieu industriel',
      },
      {
        designation: 'Premiers Secours en Entreprise',
        description: 'Formation pratique aux premiers secours et RCP',
      },
      {
        designation: 'Prévention des Risques Professionnels',
        description: 'Sensibilisation aux risques spécifiques à chaque secteur',
      },
      {
        designation: 'Gestion du Stress au Travail',
        description: 'Techniques de gestion du stress et bien-être en entreprise',
      },
      {
        designation: 'Ergonomie des Postes de Travail',
        description: 'Amélioration de l\'ergonomie et prévention des troubles musculo-squelettiques',
      },
      {
        designation: 'Communication Efficace en Équipe',
        description: 'Développement des compétences en communication interne',
      },
    ];

    const formationIds = [];
    for (const formation of formations) {
      const [result] = await connection.execute(
        `INSERT IGNORE INTO formations (designation, description)
         VALUES (?, ?)`,
        [formation.designation, formation.description]
      );
      formationIds.push(result.insertId || (await connection.execute(
        'SELECT id FROM formations WHERE designation = ?',
        [formation.designation]
      ))[0][0].id);
    }
    console.log('✅ Formations ajoutées\n');

    // ===== VISITES ENTREPRISE =====
    console.log('🏭 Ajout des visites entreprise...');
    const visitesEntreprise = [
      {
        adherant_id: adherantIds[0],
        date_heure: '2025-02-01 09:00:00',
        observations: 'Bon état général des locaux, quelques améliorations recommandées',
        is_valid: true,
      },
      {
        adherant_id: adherantIds[1],
        date_heure: '2025-02-10 14:30:00',
        observations: 'Investigation suite à incident léger signalé',
        is_valid: false,
      },
      {
        adherant_id: adherantIds[2],
        date_heure: '2025-02-15 10:00:00',
        observations: 'Inspection de routine - tout conforme',
        is_valid: true,
      },
      {
        adherant_id: adherantIds[0],
        date_heure: '2025-03-05 08:30:00',
        observations: 'Visite de suivi post-formation',
        is_valid: true,
      },
      {
        adherant_id: adherantIds[1],
        date_heure: '2025-03-12 15:00:00',
        observations: 'Contrôle des installations de sécurité',
        is_valid: false,
      },
    ];

    for (const visite of visitesEntreprise) {
      await connection.execute(
        `INSERT IGNORE INTO visite_entreprise (adherant_id, date_heure, observations, is_valid)
         VALUES (?, ?, ?, ?)`,
        [visite.adherant_id, visite.date_heure, visite.observations, visite.is_valid]
      );
    }
    console.log('✅ Visites entreprise ajoutées\n');

    // ===== VISITES SYSTÉMATIQUES =====
    console.log('📋 Ajout des visites systématiques...');
    const visitesSys = [
      {
        adherant_id: adherantIds[0],
        date_deb: '2025-03-05',
        date_fin: '2025-03-06',
        observations: 'Visite systématique du secteur primaire',
        is_valid: false,
      },
      {
        adherant_id: adherantIds[2],
        date_deb: '2025-02-20',
        date_fin: '2025-02-21',
        observations: 'Visite systématique du secteur tertiaire',
        is_valid: true,
      },
      {
        adherant_id: adherantIds[1],
        date_deb: '2025-03-10',
        date_fin: '2025-03-11',
        observations: 'Visite systématique complète des installations',
        is_valid: false,
      },
      {
        adherant_id: adherantIds[0],
        date_deb: '2025-04-01',
        date_fin: '2025-04-02',
        observations: 'Visite de suivi - vérification des normes',
        is_valid: true,
      },
    ];

    for (const visite of visitesSys) {
      await connection.execute(
        `INSERT IGNORE INTO visite_systematique (adherant_id, date_deb, date_fin, observations, is_valid)
         VALUES (?, ?, ?, ?, ?)`,
        [visite.adherant_id, visite.date_deb, visite.date_fin, visite.observations, visite.is_valid]
      );
    }
    console.log('✅ Visites systématiques ajoutées\n');

    // ===== SENSIBILISATIONS =====
    console.log('🎓 Ajout des sensibilisations...');
    const sensibilisations = [
      {
        sujet: 'Sensibilisation Santé et Sécurité',
        description: 'Campagne de sensibilisation aux bonnes pratiques SSE',
        date: '2025-02-05',
        centre_id: centreIds[0],
        adherant_id: adherantIds[0],
        is_valid: true,
      },
      {
        sujet: 'Sensibilisation Environnement',
        description: 'Sensibilisation à la protection de l\'environnement en entreprise',
        date: '2025-03-15',
        centre_id: centreIds[1],
        adherant_id: adherantIds[1],
        is_valid: false,
      },
      {
        sujet: 'Prévention Incendies',
        description: 'Démonstration et sensibilisation aux risques d\'incendie',
        date: '2025-02-28',
        centre_id: centreIds[2],
        adherant_id: adherantIds[2],
        is_valid: true,
      },
      {
        sujet: 'Gestion des Déchets',
        description: 'Sensibilisation à la gestion responsable des déchets',
        date: '2025-03-20',
        centre_id: centreIds[0],
        adherant_id: adherantIds[0],
        is_valid: false,
      },
      {
        sujet: 'Addictions et Travail',
        description: 'Sensibilisation aux risques liés aux addictions en milieu professionnel',
        date: '2025-04-10',
        centre_id: centreIds[1],
        adherant_id: adherantIds[1],
        is_valid: true,
      },
    ];

    for (const sens of sensibilisations) {
      await connection.execute(
        `INSERT IGNORE INTO sensibilisations (sujet, description, date, centre_id, adherant_id, is_valid)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sens.sujet, sens.description, sens.date, sens.centre_id, sens.adherant_id, sens.is_valid]
      );
    }
    console.log('✅ Sensibilisations ajoutées\n');

    // ===== PARTICIPATIONS =====
    console.log('✍️ Ajout des participations aux formations...');
    const [allFormations] = await connection.execute('SELECT id FROM formations');
    
    // Chaque adhérant participe à plusieurs formations
    for (const adherantId of adherantIds) {
      for (let i = 0; i < allFormations.length; i++) {
        const startDate = ['2025-02-15', '2025-03-10', '2025-02-28', '2025-04-01', '2025-04-15', '2025-05-01'][i] || '2025-02-15';
        const endDate = ['2025-02-17', '2025-03-11', '2025-03-02', '2025-04-02', '2025-04-16', '2025-05-03'][i] || '2025-02-17';
        const isValid = i % 2 === 0; // Alternater true/false
        
        await connection.execute(
          `INSERT IGNORE INTO participer (adherant_id, formation_id, date_deb, date_fin, is_valid)
           VALUES (?, ?, ?, ?, ?)`,
          [adherantId, allFormations[i].id, startDate, endDate, isValid]
        );
      }
    }
    console.log('✅ Participations ajoutées\n');

    console.log('🎉 Seed terminé avec succès!\n');
    console.log('========================================');
    console.log('📊 RÉSUMÉ DES DONNÉES AJOUTÉES:');
    console.log('========================================');
    console.log(`✓ ${centres.length} centres`);
    console.log(`✓ 1 admin`);
    console.log(`✓ ${medecinChefs.length} médecins chefs`);
    console.log(`✓ ${adherants.length} adhérants`);
    console.log(`✓ ${formations.length} formations`);
    console.log(`✓ ${visitesEntreprise.length} visites entreprise`);
    console.log(`✓ ${visitesSys.length} visites systématiques`);
    console.log(`✓ ${sensibilisations.length} sensibilisations`);
    console.log(`✓ ${adherants.length * formations.length} participations aux formations`);
    console.log('\n========================================');
    console.log('🔐 IDENTIFIANTS DE TEST:');
    console.log('========================================');
    console.log('\n👨‍💼 ADMIN:');
    console.log('   Email: admin@amit.com');
    console.log('   Password: Admin@123\n');
    console.log('👨‍⚕️ MÉDECINS CHEFS:');
    medecinChefs.forEach(m => {
      console.log(`   Email: ${m.email}`);
      console.log(`   Password: Medecin@123`);
    });
    console.log('\n🏢 ADHÉRANTS (ENTREPRISES):');
    adherants.forEach(a => {
      console.log(`   Email: ${a.email}`);
      console.log(`   Password: Adherant@123`);
      console.log(`   Entreprise: ${a.raison_sociale}`);
    });
    console.log('\n========================================\n');

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run seed
seedDatabase();
