const axios = require('axios');

async function testRoute() {
  try {
    const response = await axios.post('http://localhost:5000/api/v2/auth/register-adherent-confirmed', {
      email: 'test@test.com',
      password: 'password123',
      raison_sociale: 'Test Company',
      contact: 'test@company.com',
      telephone: '0612345678',
      confirmationCode: '123456'
    });
    console.log('✅ Route works:', response.status);
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
  process.exit(0);
}

testRoute();
