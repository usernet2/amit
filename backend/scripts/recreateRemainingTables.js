const pool = require('../config/database');

const recreateRemainingTables = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔄 Recréation des tables restantes...\n');
    
    // Create Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'adherent',
        centre_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (centre_id) REFERENCES centres(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table users créée');
    
    // Create Visite d'Entreprise table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visite_entreprise (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date_heure DATETIME NOT NULL,
        adherent_id INT NOT NULL,
        is_valid BOOLEAN DEFAULT true,
        observations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table visite_entreprise créée');
    
    // Create Visite Systématique table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visite_systematique (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date_deb DATE NOT NULL,
        date_fin DATE NOT NULL,
        adherent_id INT NOT NULL,
        is_valid BOOLEAN DEFAULT true,
        observations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table visite_systematique créée');
    
    // Create Formations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS formations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        designation VARCHAR(150) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table formations créée');
    
    // Create Participer table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS participer (
        id INT AUTO_INCREMENT PRIMARY KEY,
        formation_id INT NOT NULL,
        adherent_id INT NOT NULL,
        date_deb DATE NOT NULL,
        date_fin DATE NOT NULL,
        is_valid BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_participation (formation_id, adherent_id),
        FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE,
        FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table participer créée');
    
    // Create Sensibilisations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sensibilisations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sujet VARCHAR(150) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        centre_id INT,
        adherent_id INT NOT NULL,
        is_valid BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table sensibilisations créée');
    
    // Create Confirmation Codes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS confirmation_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        code VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        is_used BOOLEAN DEFAULT false,
        UNIQUE KEY unique_code (email, code)
      )
    `);
    console.log('✅ Table confirmation_codes créée');
    
    console.log('\n🎉 Toutes les tables ont été recréées avec succès!\n');
    
    await connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

recreateRemainingTables();
