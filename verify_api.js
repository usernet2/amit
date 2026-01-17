const axios = require('axios');

const API_URL = 'http://localhost:5000/api/admin';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzcxMzI3NDN9.RmqkjTg-8VD0FGpQI0TiMDhZZhCcr0EZ1RP6vJMF32A';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${ADMIN_TOKEN}`
  }
});

async function verifyAPI() {
  try {
    console.log('🔍 Testing API endpoints for adherent_nom field...\n');

    // Test visites
    console.log('📅 Testing /visites endpoint...');
    const visitesRes = await axiosInstance.get('/visites');
    if (visitesRes.data.visiteEntreprise && visitesRes.data.visiteEntreprise.length > 0) {
      const v = visitesRes.data.visiteEntreprise[0];
      console.log(`✅ Visite Entreprise: ${v.id ? '✓' : '✗'} adherent_nom: ${v.adherent_nom ? '✓' : '✗'}`);
      if (v.adherent_nom) console.log(`   → Name: "${v.adherent_nom}"`);
    }
    if (visitesRes.data.visiteSystematique && visitesRes.data.visiteSystematique.length > 0) {
      const v = visitesRes.data.visiteSystematique[0];
      console.log(`✅ Visite Systématique: ${v.id ? '✓' : '✗'} adherent_nom: ${v.adherent_nom ? '✓' : '✗'}`);
      if (v.adherent_nom) console.log(`   → Name: "${v.adherent_nom}"`);
    }

    // Test sensibilisations
    console.log('\n🎓 Testing /sensibilisations endpoint...');
    const sensRes = await axiosInstance.get('/sensibilisations');
    if (sensRes.data && sensRes.data.length > 0) {
      const s = sensRes.data[0];
      console.log(`✅ Sensibilisation: ${s.id ? '✓' : '✗'} adherent_nom: ${s.adherent_nom ? '✓' : '✗'}`);
      if (s.adherent_nom) console.log(`   → Name: "${s.adherent_nom}"`);
    }

    // Test cancelled
    console.log('\n🚫 Testing /cancelled endpoint...');
    const cancelledRes = await axiosInstance.get('/cancelled');
    if (cancelledRes.data && cancelledRes.data.length > 0) {
      const item = cancelledRes.data[0];
      console.log(`✅ Cancelled item found: adherent_nom: ${item.adherent_nom ? '✓' : '✗'}`);
      if (item.adherent_nom) console.log(`   → Name: "${item.adherent_nom}"`);
    }

    console.log('\n✅ API verification complete!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

verifyAPI();
