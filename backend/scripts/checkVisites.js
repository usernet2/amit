const pool = require('../config/database');

const checkVisites = async () => {
  try {
    const conn = await pool.getConnection();
    
    console.log('\n=== VISITE SYSTEMATIQUE ===');
    const [syst] = await conn.execute('SELECT * FROM visite_systematique ORDER BY adherent_id');
    console.table(syst);
    
    console.log('\n=== VISITE ENTREPRISE ===');
    const [ent] = await conn.execute('SELECT * FROM visite_entreprise ORDER BY adherent_id');
    console.table(ent);
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total visite_systematique: ${syst.length}`);
    console.log(`Total visite_entreprise: ${ent.length}`);
    
    await conn.release();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
};

checkVisites();
