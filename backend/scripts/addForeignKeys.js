const pool = require('../config/database');

const addForeignKeys = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('Adding foreign keys to participer table...');
    
    // Add foreign key for formation_id
    await connection.execute(`
      ALTER TABLE participer 
      ADD CONSTRAINT fk_participer_formation 
      FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
    `);
    console.log('✓ Foreign key added for formation_id');
    
    // Add foreign key for adherant_id
    await connection.execute(`
      ALTER TABLE participer 
      ADD CONSTRAINT fk_participer_adherant 
      FOREIGN KEY (adherant_id) REFERENCES adherants(id) ON DELETE CASCADE
    `);
    console.log('✓ Foreign key added for adherant_id');
    
    connection.release();
    console.log('✅ Foreign keys successfully added!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

addForeignKeys();
