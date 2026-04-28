require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // List existing users
  const users = await User.find().select('name email role isVerified createdAt').lean();
  console.log(`\n📋 Existing users (${users.length} total):`);
  users.forEach(u => console.log(`   [${u.role}] ${u.email}  verified:${u.isVerified}`));

  // Create or update admin account
  let admin = await User.findOne({ email: 'admin@mynews.my' });
  if (admin) {
    admin.password = 'Admin@123';
    admin.isVerified = true;
    admin.role = 'admin';
    await admin.save();
    console.log('\n✅ Admin password reset to Admin@123');
  } else {
    await User.create({
      name: 'System Admin',
      email: 'admin@mynews.my',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
      provider: 'local',
    });
    console.log('\n✅ Admin account created: admin@mynews.my / Admin@123');
  }

  await mongoose.disconnect();
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
