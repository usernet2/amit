const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const medecinChefData = [
  { centre_id: 1, centre_name: 'ANTANIMENA' },
  { centre_id: 2, centre_name: 'BEHORIRIKA' },
  { centre_id: 3, centre_name: 'TANJOMBATO' },
  { centre_id: 4, centre_name: 'TALATAMATY' },
  { centre_id: 5, centre_name: 'SABOTSY NAMEHANA' },
  { centre_id: 6, centre_name: 'IVATO' },
  { centre_id: 7, centre_name: 'STOCKS DIMANCHE' },
  { centre_id: 8, centre_name: 'DENTISTERIE' },
  { centre_id: 9, centre_name: 'LABORATOIRE' },
  { centre_id: 10, centre_name: 'SORTIES PONCTUELLES' },
  { centre_id: 11, centre_name: 'GRAND STOCK PERIMES' },
  { centre_id: 12, centre_name: 'RETOUR VERS FOURNISSEUR' },
  { centre_id: 13, centre_name: 'MAJOR BEHO' },
  { centre_id: 14, centre_name: 'GRAND STOCK' },
  { centre_id: 15, centre_name: 'ADM' },
  { centre_id: 16, centre_name: 'BEHORIRIKA NUIT' }
];

const seedMedecinChefs = async () => {
  let connection;
  try {
    connection = await pool.getConnection();

    console.log('🔄 Starting to populate medecinchefs table...');

    // First, get all medecin_chef users
    const [users] = await connection.execute(
      `SELECT id, email FROM users WHERE role = 'medecin_chef' ORDER BY id`
    );

    console.log(`Found ${users.length} medecin_chef users`);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const centre_id = i + 1;

      try {
        // Check if record already exists
        const [existing] = await connection.execute(
          `SELECT id FROM medecinchefs WHERE user_id = ?`,
          [user.id]
        );

        if (existing.length > 0) {
          console.log(`⚠️  Record already exists for user ${user.email}`);
          continue;
        }

        // Insert medecinchef record
        await connection.execute(
          `INSERT INTO medecinchefs (user_id, centre_id, nom, prenom, specialisation) VALUES (?, ?, ?, ?, ?)`,
          [user.id, centre_id, 'Chef', `Centre ${centre_id}`, 'Médecin']
        );

        console.log(`✅ Created medecinchef record for ${user.email} (Centre ${centre_id})`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  User already exists for ${centre.centre_name}`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Successfully seeded all medecin_chef users!');
    console.log('\n📝 Created users:');
    medecinChefData.forEach((centre) => {
      const email = `medecin.chef.${centre.centre_id}@exemple.com`;
      const password = `MedecinChef@${centre.centre_id}`;
      console.log(`   Centre: ${centre.centre_name}`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}\n`);
    });

  } catch (error) {
    console.error('❌ Error seeding medecin_chef users:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
    process.exit(0);
  }
};

seedMedecinChefs();
