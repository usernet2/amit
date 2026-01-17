const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'amit',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function addCancelledActivities() {
  try {
    const connection = await pool.getConnection();

    console.log('Adding cancelled activities...');

    // Add 1 cancelled visite_entreprise
    await connection.execute(
      'UPDATE visite_entreprise SET is_valid = 0 WHERE id = 1'
    );
    console.log('✅ Set visite_entreprise id=1 as cancelled');

    // Add 1 cancelled visite_systematique
    await connection.execute(
      'UPDATE visite_systematique SET is_valid = 0 WHERE id = 1'
    );
    console.log('✅ Set visite_systematique id=1 as cancelled');

    // Add 1 cancelled sensibilisation
    await connection.execute(
      'UPDATE sensibilisations SET is_valid = 0 WHERE id = 1'
    );
    console.log('✅ Set sensibilisation id=1 as cancelled');

    // Add 1 cancelled participation
    await connection.execute(
      'UPDATE participer SET is_valid = 0 WHERE id = 1'
    );
    console.log('✅ Set participation id=1 as cancelled');

    // Verify
    const [cancelled] = await connection.execute(
      'SELECT COUNT(*) as count FROM visite_entreprise WHERE is_valid = 0'
    );
    console.log(`\n📊 Total cancelled visites_entreprise: ${cancelled[0].count}`);

    const [cancelledSys] = await connection.execute(
      'SELECT COUNT(*) as count FROM visite_systematique WHERE is_valid = 0'
    );
    console.log(`📊 Total cancelled visites_systematique: ${cancelledSys[0].count}`);

    const [cancelledSens] = await connection.execute(
      'SELECT COUNT(*) as count FROM sensibilisations WHERE is_valid = 0'
    );
    console.log(`📊 Total cancelled sensibilisations: ${cancelledSens[0].count}`);

    const [cancelledPart] = await connection.execute(
      'SELECT COUNT(*) as count FROM participer WHERE is_valid = 0'
    );
    console.log(`📊 Total cancelled participations: ${cancelledPart[0].count}`);

    connection.release();
    console.log('\n✅ Done! Refresh the page to see cancelled activities.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addCancelledActivities();
