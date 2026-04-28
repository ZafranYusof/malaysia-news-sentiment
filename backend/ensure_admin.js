require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // List all existing users
  const all = await User.find().select('name email role isVerified').lean();
  console.log(`Existing users (${all.length}):`);
  all.forEach(u => console.log(`  [${u.role}] ${u.email}  verified:${u.isVerified}  name:${u.name}`));

  // Create or reset admin account
  let admin = await User.findOne({ email: 'admin@mynews.my' });
  if (admin) {
    admin.password = 'Admin@123';
    admin.isVerified = true;
    admin.role = 'admin';
    await admin.save();
    console.log('\nAdmin password reset to: Admin@123');
  } else {
    await User.create({
      name: 'System Admin',
      email: 'admin@mynews.my',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
      provider: 'local',
    });
    console.log('\nAdmin account created: admin@mynews.my / Admin@123');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
