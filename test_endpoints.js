const axios = require('axios');

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Admin token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNDc1MTU3N30.Z9rXSNZaXkXxJ9EYkXpCa2fJ0OX4_ylPqKy0DPLPF8c';

API.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function testEndpoints() {
  try {
    console.log('\n========== TESTING API ENDPOINTS ==========\n');

    // Test Formations
    console.log('1️⃣  FORMATIONS');
    const formations = await API.get('/admin/formations');
    console.log(`   ✅ Retrieved ${formations.data.length} formations`);
    if (formations.data.length > 0) {
      console.log(`   Sample: ${formations.data[0].designation}`);
    }

    // Test Visites
    console.log('\n2️⃣  VISITES');
    const visites = await API.get('/admin/visites');
    console.log(`   ✅ Retrieved visites data`);
    if (visites.data.visiteEntreprise) {
      console.log(`   - Visites d'entreprise: ${visites.data.visiteEntreprise.length}`);
    }
    if (visites.data.visiteSystematique) {
      console.log(`   - Visites systématiques: ${visites.data.visiteSystematique.length}`);
    }

    // Test Sensibilisations
    console.log('\n3️⃣  SENSIBILISATIONS');
    const sensibilisations = await API.get('/admin/sensibilisations');
    console.log(`   ✅ Retrieved ${sensibilisations.data.length} sensibilisations`);
    if (sensibilisations.data.length > 0) {
      console.log(`   Sample: ${sensibilisations.data[0].sujet}`);
    }

    // Test Cancelled Activities
    console.log('\n4️⃣  CANCELLED ACTIVITIES');
    const cancelled = await API.get('/admin/cancelled');
    console.log(`   ✅ Retrieved cancelled activities`);
    console.log(`   Data: ${JSON.stringify(cancelled.data, null, 2).substring(0, 200)}...`);

    // Test Participations (Formations enrollment)
    console.log('\n5️⃣  PARTICIPATIONS');
    const participations = await API.get('/admin/participations');
    console.log(`   ✅ Retrieved ${participations.data.length} participations`);
    if (participations.data.length > 0) {
      console.log(`   Sample: Formation ${participations.data[0].formation_id} - Enterprise ${participations.data[0].adherent_id}`);
    }

    // Test Enterprises
    console.log('\n6️⃣  ENTERPRISES');
    const enterprises = await API.get('/admin/entreprises');
    console.log(`   ✅ Retrieved ${enterprises.data.length} enterprises`);
    if (enterprises.data.length > 0) {
      console.log(`   Sample: ${enterprises.data[0].raison_sociale}`);
    }

    // Test Dashboard
    console.log('\n7️⃣  ADMIN DASHBOARD');
    const dashboard = await API.get('/admin/dashboard');
    console.log(`   ✅ Retrieved dashboard stats`);
    console.log(`   - Total Centres: ${dashboard.data.totalCentres}`);
    console.log(`   - Total Enterprises: ${dashboard.data.totalEntreprises}`);
    console.log(`   - Total Formations: ${dashboard.data.totalFormations}`);
    console.log(`   - Active Visites: ${dashboard.data.visitesActive}`);
    console.log(`   - Active Sensibilisations: ${dashboard.data.sensibilisationsActive}`);

    console.log('\n✅ ALL ENDPOINTS WORKING CORRECTLY!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error(`Status: ${error.response.status}`);
    }
    process.exit(1);
  }
}

testEndpoints();
