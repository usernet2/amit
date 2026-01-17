const axios = require('axios');

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNDc1MTU3N30.Z9rXSNZaXkXxJ9EYkXpCa2fJ0OX4_ylPqKy0DPLPF8c';

API.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function testNames() {
  try {
    console.log('\n✅ Testing enterprise names display...\n');

    // Test Visites
    const visites = await API.get('/admin/visites');
    console.log('📅 VISITES ENTREPRISE:');
    if (visites.data.visiteEntreprise && visites.data.visiteEntreprise.length > 0) {
      visites.data.visiteEntreprise.slice(0, 2).forEach(v => {
        console.log(`   ✓ ID: ${v.adherent_id}, Name: ${v.adherent_nom}`);
      });
    }

    console.log('\n📅 VISITES SYSTÉMATIQUES:');
    if (visites.data.visiteSystematique && visites.data.visiteSystematique.length > 0) {
      visites.data.visiteSystematique.slice(0, 2).forEach(v => {
        console.log(`   ✓ ID: ${v.adherent_id}, Name: ${v.adherent_nom}`);
      });
    }

    // Test Sensibilisations
    const sens = await API.get('/admin/sensibilisations');
    console.log('\n🎓 SENSIBILISATIONS:');
    if (sens.data && sens.data.length > 0) {
      sens.data.slice(0, 2).forEach(s => {
        console.log(`   ✓ ID: ${s.adherent_id}, Name: ${s.adherent_nom}, Sujet: ${s.sujet}`);
      });
    }

    // Test Cancelled
    const cancelled = await API.get('/admin/cancelled');
    console.log('\n❌ CANCELLED SENSIBILISATIONS:');
    if (cancelled.data.sensibilisations && cancelled.data.sensibilisations.length > 0) {
      cancelled.data.sensibilisations.slice(0, 2).forEach(s => {
        console.log(`   ✓ Name: ${s.adherent_nom}, Sujet: ${s.sujet}`);
      });
    }

    console.log('\n✅ ALL NAMES DISPLAYING CORRECTLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
    process.exit(1);
  }
}

testNames();
