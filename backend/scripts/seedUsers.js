const pool = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Script to seed demo users for each role
 * 
 * Roles:
 * 1. Admin - Full system access
 * 2. Médecin Chef - Center supervision
 * 3. Adhérant - Enterprise management
 */

const seedUsers = async () => {
  let connection;
  try {
    connection = await pool.getConnection();

    console.log('🌱 Starting user seeding...\n');

    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const medecinPassword = await bcrypt.hash('Medecin@123', 10);
    const adherantPassword = await bcrypt.hash('Adherant@123', 10);

    // 1. Create Admin User
    console.log('📝 Creating Admin user...');
    try {
      const [adminResult] = await connection.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['admin@amit.com', adminPassword, 'admin']
      );
      console.log('✅ Admin user created');
      console.log(`   Email: admin@amit.com`);
      console.log(`   Password: Admin@123\n`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('⚠️  Admin user already exists\n');
      } else {
        throw error;
      }
    }

    // 2. Create Centre(s) for Médecin Chef
    console.log('📝 Creating Centre...');
    let centreId;
    try {
      const [centreResult] = await connection.execute(
        'INSERT INTO centres (nom, region) VALUES (?, ?)',
        [
          'Centre Nord Santé',
          'Rabat-Salé-Kénitra'
        ]
      );
      centreId = centreResult.insertId;
      console.log('✅ Centre created');
      console.log(`   ID: ${centreId}`);
      console.log(`   Nom: Centre Nord Santé\n`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('⚠️  Centre already exists, checking existing...');
        const [existingCentres] = await connection.execute(
          'SELECT id FROM centres LIMIT 1'
        );
        if (existingCentres.length > 0) {
          centreId = existingCentres[0].id;
          console.log(`   Using existing Centre ID: ${centreId}\n`);
        } else {
          throw new Error('No centre found and could not create new one');
        }
      } else {
        throw error;
      }
    }

    // 3. Create Médecin Chef User
    console.log('📝 Creating Médecin Chef user...');
    try {
      const [medecinResult] = await connection.execute(
        'INSERT INTO users (email, password, role, centre_id) VALUES (?, ?, ?, ?)',
        ['medecin-nord@amit.com', medecinPassword, 'medecin_chef', centreId]
      );
      console.log('✅ Médecin Chef user created');
      console.log(`   Email: medecin-nord@amit.com`);
      console.log(`   Password: Medecin@123`);
      console.log(`   Centre ID: ${centreId}\n`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('⚠️  Médecin Chef user already exists\n');
      } else {
        throw error;
      }
    }

    // 4. Create Adhérant User with Enterprise
    console.log('📝 Creating Adhérant user with enterprise...');
    try {
      const [adherantUserResult] = await connection.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['acme@example.com', adherantPassword, 'adherant']
      );

      const adherantUserId = adherantUserResult.insertId;

      // Create enterprise for adherant
      await connection.execute(
        'INSERT INTO adherants (raison_sociale, siege, contact, email, user_id, centre_id) VALUES (?, ?, ?, ?, ?, ?)',
        [
          'ACME Corporation',
          '456 Avenue Business, Casablanca',
          '+212612987654',
          'acme@example.com',
          adherantUserId,
          centreId
        ]
      );

      console.log('✅ Adhérant user created with enterprise');
      console.log(`   Email: acme@example.com`);
      console.log(`   Password: Adherant@123`);
      console.log(`   Enterprise: ACME Corporation`);
      console.log(`   Centre ID: ${centreId}\n`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('⚠️  Adhérant user already exists\n');
      } else {
        throw error;
      }
    }

    // Display summary
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 USER SEEDING COMPLETED!\n');
    console.log('📋 Demo Accounts:\n');
    
    console.log('👨‍💼 ADMIN');
    console.log('   Email: admin@amit.com');
    console.log('   Password: Admin@123');
    console.log('   Role: Administrateur');
    console.log('   Access: Full system access\n');

    console.log('🩺 MÉDECIN CHEF');
    console.log('   Email: medecin-nord@amit.com');
    console.log('   Password: Medecin@123');
    console.log('   Role: Médecin Chef');
    console.log('   Access: Center supervision\n');

    console.log('🏭 ADHÉRANT (ENTERPRISE)');
    console.log('   Email: acme@example.com');
    console.log('   Password: Adherant@123');
    console.log('   Role: Adhérant');
    console.log('   Enterprise: ACME Corporation');
    console.log('   Access: Enterprise management\n');

    console.log('═══════════════════════════════════════════════════\n');

    console.log('✅ All users seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Run the seeding
seedUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
