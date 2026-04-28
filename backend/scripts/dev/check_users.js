const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../../models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find().select('name email role provider isVerified').lean();
    console.log('--- User List ---');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email || u.phone}) | Role: ${u.role} | Verified: ${u.isVerified} | Provider: ${u.provider}`);
    });
    console.log('-----------------');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

listUsers();
