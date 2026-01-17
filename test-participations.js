const http = require('http');

// Test function
async function testParticipations() {
  try {
    // 1. Login
    const loginData = JSON.stringify({
      email: 'admin@amit.com',
      password: 'Admin@123'
    });

    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const loginResponse = await new Promise((resolve, reject) => {
      const req = http.request(loginOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.write(loginData);
      req.end();
    });

    const token = loginResponse.token;
    console.log('✅ Login successful');
    console.log(`Token: ${token.substring(0, 30)}...`);

    // 2. Get participations
    const partOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/participations',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const partResponse = await new Promise((resolve, reject) => {
      const req = http.request(partOptions, (res) => {
        console.log(`\n✅ Status: ${res.statusCode}`);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            console.log('Raw response:', data);
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    console.log(`✅ Participations reçues: ${partResponse.length}`);
    if (partResponse.length > 0) {
      console.log('\nPremière participation:');
      console.log(JSON.stringify(partResponse[0], null, 2));
    } else {
      console.log('⚠️  Aucune participation trouvée!');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  }
}

testParticipations();
