/**
 * Creates a demo account via the running API and then marks it verified directly.
 * Usage: node scripts/createDemoUser.js
 */
require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');

const body = JSON.stringify({
  name: 'Demo User',
  email: 'demo@mynews.my',
  password: 'demo1234',
});

// Step 1 — attempt to register via the running server
const req = http.request(
  { hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
  (res) => {
    let data = '';
    res.on('data', d => (data += d));
    res.on('end', async () => {
      const result = JSON.parse(data);
      console.log('Register response:', result.message || result.error);

      // Step 2 — mark as verified via direct DB update using shared mongoose
      try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
        const User = require('./models/User');
        const user = await User.findOneAndUpdate(
          { email: 'demo@mynews.my' },
          { isVerified: true, verificationToken: undefined, verificationExpires: undefined },
          { new: true }
        );
        if (user) {
          console.log('\n──────────────────────────────────────');
          console.log('  ✅ Demo account ready!');
          console.log('  📧 Email   : demo@mynews.my');
          console.log('  🔑 Password: demo1234');
          console.log('──────────────────────────────────────\n');
        } else {
          console.log('⚠️  Could not find user after registration.');
        }
        await mongoose.disconnect();
      } catch (e) {
        console.error('DB error:', e.message);
      }
      process.exit(0);
    });
  }
);

req.on('error', (e) => {
  console.error('❌ API not reachable:', e.message);
  console.log('   Make sure the backend is running: npm start (in /backend)');
  process.exit(1);
});

req.write(body);
req.end();
