const http = require('http');

const body = JSON.stringify({ email: 'admin@mynews.my', password: 'Admin@123' });

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    if (parsed.token) {
      console.log('✅ LOGIN SUCCESS');
      console.log('   User:', parsed.user.name, '|', parsed.user.email, '| role:', parsed.user.role);
      console.log('   Token (first 30 chars):', parsed.token.substring(0, 30) + '...');
    } else {
      console.log('❌ LOGIN FAILED');
      console.log('   Response:', JSON.stringify(parsed));
    }
  });
});

req.on('error', (e) => console.error('❌ Connection error:', e.message));
req.write(body);
req.end();
