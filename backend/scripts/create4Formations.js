const pool = require('../config/database');

const create4Formations = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('📚 Création de 4 formations...\n');
    
    const formations = [
      {
        designation: 'Formation Sécurité et Hygiène au Travail',
        description: 'Formation complète sur les règles de sécurité, hygiène et prévention des risques en milieu professionnel'
      },
      {
        designation: 'Formation Gestion Administrative',
        description: 'Cours sur la gestion administrative, la documentation et les procédures administratives'
      },
      {
        designation: 'Formation Développement Personnel',
        description: 'Programme de développement personnel, leadership et communication professionnelle'
      },
      {
        designation: 'Formation Compétences Numériques',
        description: 'Formation sur les outils numériques, logiciels bureautiques et technologies modernes'
      }
    ];
    
    let count = 0;
    
    for (const formation of formations) {
      try {
        await connection.execute(
          `INSERT INTO formations (designation, description) VALUES (?, ?)`,
          [formation.designation, formation.description]
        );
        count++;
        console.log(`✅ Formation créée: ${formation.designation}`);
      } catch (err) {
        if (err.message.includes('Duplicate entry')) {
          console.log(`⚠️  Formation existante: ${formation.designation}`);
        } else {
          console.log(`❌ Erreur: ${err.message}`);
        }
      }
    }
    
    console.log(`\n🎉 ${count} formations créées avec succès!\n`);
    
    // Display all formations
    const [allFormations] = await connection.execute(
      `SELECT id, designation, description FROM formations`
    );
    
    console.log('========================================');
    console.log('📋 FORMATIONS DISPONIBLES:');
    console.log('========================================\n');
    
    allFormations.forEach(f => {
      console.log(`📌 ID: ${f.id} - ${f.designation}`);
      console.log(`   Description: ${f.description}\n`);
    });
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

create4Formations();
