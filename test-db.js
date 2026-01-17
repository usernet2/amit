const mysql = require('mysql2/promise');

async function testDatabase() {
  try {
    console.log('🔌 Test de connexion à la base de données...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'amit'
    });
    
    console.log('✅ Connexion réussie!');
    
    // Test participations table
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM participer');
    console.log(`✅ Table participer: ${rows[0].count} enregistrements`);
    
    // Test formations table
    const [formations] = await connection.execute('SELECT COUNT(*) as count FROM formations');
    console.log(`✅ Table formations: ${formations[0].count} enregistrements`);
    
    // Test adherents table
    const [adherents] = await connection.execute('SELECT COUNT(*) as count FROM adherents');
    console.log(`✅ Table adherents: ${adherents[0].count} enregistrements`);
    
    // Test actual query
    const [result] = await connection.execute(`
      SELECT 
        p.id,
        p.date_deb,
        p.is_valid,
        f.designation,
        a.raison_sociale
      FROM participer p
      JOIN formations f ON p.formation_id = f.id
      JOIN adherents a ON p.adherent_id = a.id
      LIMIT 2
    `);
    
    console.log(`✅ Test JOIN réussi! ${result.length} résultats`);
    console.log('Exemple:', result[0]);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testDatabase();
