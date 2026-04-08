const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let user = await User.findOne({ email: 'demo@mynews.my' });

    if (!user) {
      console.log('Admin user not found. Creating one...');
      user = new User({
        name: 'Zafran',
        email: 'demo@mynews.my',
        password: 'demo1234',
        role: 'admin',
        isVerified: true
      });
    } else {
      console.log('Resetting admin password to demo1234...');
      user.password = 'demo1234';
      user.role = 'admin';
      user.isVerified = true;
    }

    await user.save();
    console.log('Admin account (demo@mynews.my) has been reset with password: demo1234');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

resetAdmin();
