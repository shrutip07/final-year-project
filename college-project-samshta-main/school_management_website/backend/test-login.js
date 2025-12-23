// Test login endpoint directly
const http = require('http');

const loginData = JSON.stringify({
  email: 'sejalsonawane27@gmail.com',
  password: 'Sejal@123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('BODY:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('PARSED:', parsed);
    } catch (e) {
      console.log('Could not parse JSON');
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`PROBLEM WITH REQUEST: ${e.message}`);
  process.exit(1);
});

console.log('📤 Sending login request to http://localhost:5000/api/auth/login');
console.log('Payload:', loginData);
req.write(loginData);
req.end();
