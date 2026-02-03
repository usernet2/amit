const pool = require('../config/database');

const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create Centres table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS centres (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(150) NOT NULL,
        adresse VARCHAR(200),
        contact VARCHAR(20),
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Users table - UPDATED with role_type
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'adherant',
        centre_id INT COMMENT 'Pour medecin_chef',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (centre_id) REFERENCES centres(id) ON DELETE SET NULL
      )
    `);

    // Create Entreprises Adhérantes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS adherants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        raison_sociale VARCHAR(150) NOT NULL,
        siege VARCHAR(200),
        contact VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        user_id INT NOT NULL,
        centre_id INT NOT NULL,
        numero_identification VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (centre_id) REFERENCES centres(id) ON DELETE RESTRICT
      )
    `);

    // Create Médecins Chefs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS medecinchefs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        centre_id INT NOT NULL,
        nom VARCHAR(100),
        prenom VARCHAR(100),
        specialisation VARCHAR(150),
        contact VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (centre_id) REFERENCES centres(id) ON DELETE RESTRICT
      )
    `);

    // Create Visite d'Entreprise table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visite_entreprise (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        date_heure DATETIME NOT NULL,
        adherant_id INT UNSIGNED NOT NULL,
        is_valid BOOLEAN DEFAULT true,
        observations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (adherant_id) REFERENCES adherants(id) ON DELETE CASCADE
      )
    `);

    // Create Visite Systématique table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visite_systematique (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        date_deb DATE NOT NULL,
        date_fin DATE NOT NULL,
        adherant_id INT UNSIGNED NOT NULL,
        is_valid BOOLEAN DEFAULT true,
        observations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (adherant_id) REFERENCES adherants(id) ON DELETE CASCADE
      )
    `);

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

    // Create Participer (join table) table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS participer (
        id INT AUTO_INCREMENT PRIMARY KEY,
        formation_id INT NOT NULL,
        adherant_id INT NOT NULL,
        date_deb DATE NOT NULL,
        date_fin DATE NOT NULL,
        is_valid BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_participation (formation_id, adherant_id)
      )
    `);

    // Create Sensibilisations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sensibilisations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sujet VARCHAR(150) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        centre_id INT UNSIGNED,
        adherant_id INT UNSIGNED,
        is_valid BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (centre_id) REFERENCES centres(id) ON DELETE SET NULL,
        FOREIGN KEY (adherant_id) REFERENCES adherants(id) ON DELETE CASCADE
      )
    `);
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

    // Create Adherents Raw table (from CSV import)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS adherents_raw (
        id INT PRIMARY KEY,
        adresse VARCHAR(255),
        date_adhesion DATE,
        email VARCHAR(100),
        tel VARCHAR(30),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    connection.release();
    console.log('✅ Database tables initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
};

module.exports = initDatabase;
