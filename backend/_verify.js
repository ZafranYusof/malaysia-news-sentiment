require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const u = await User.findOneAndUpdate(
    { email: 'vexxy@test.com' },
    { isVerified: true },
    { new: true }
  );
  console.log('Verified:', u?.email, u?.isVerified);
  await mongoose.disconnect();
}
main();
