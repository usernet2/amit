const pool = require('../config/database');
const bcrypt = require('bcrypt');

const createUsersForAdherents = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('👤 Création des utilisateurs pour les 4 premiers adhérents...\n');
    
    // Get the first 4 adherents
    const [adherents] = await connection.execute(
      `SELECT id, email, raison_sociale FROM adherents WHERE id <= 4 ORDER BY id`
    );
    
    if (adherents.length === 0) {
      console.log('❌ Aucun adhérent trouvé');
      await connection.release();
      process.exit(1);
    }
    
    let userCount = 0;
    
    for (const adherent of adherents) {
      const email = adherent.email || `adherent${adherent.id}@example.com`;
      const password = 'Adherent@123'; // Default password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      try {
        await connection.execute(
          `INSERT INTO users (email, password, role, adherent_id) VALUES (?, ?, ?, ?)`,
          [email, hashedPassword, 'adherent', adherent.id]
        );
        userCount++;
        console.log(`✅ Utilisateur créé pour adhérent ${adherent.id}`);
        console.log(`   Email: ${email}`);
        console.log(`   Mot de passe: ${password}\n`);
      } catch (err) {
        if (err.message.includes('Duplicate entry')) {
          console.log(`⚠️  Adhérent ${adherent.id}: Utilisateur déjà existant (${email})\n`);
        } else {
          console.log(`❌ Adhérent ${adherent.id}: ${err.message}\n`);
        }
      }
    }
    
    console.log(`🎉 ${userCount} utilisateurs créés avec succès!\n`);
    console.log('========================================');
    console.log('🔐 IDENTIFIANTS DE CONNEXION:');
    console.log('========================================\n');
    
    // Display the created users
    const [users] = await connection.execute(
      `SELECT id, email, role, adherent_id FROM users WHERE adherent_id IN (1, 2, 3, 4) ORDER BY adherent_id`
    );
    
    users.forEach(user => {
      console.log(`👤 Adhérent ${user.adherent_id}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Mot de passe: Adherent@123\n`);
    });
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

createUsersForAdherents();
