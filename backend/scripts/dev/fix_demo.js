const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../../models/User');

async function fixDemoUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'demo@mynews.my';
    let user = await User.findOne({ email });

    if (!user) {
      console.log('Creating demo user...');
      user = new User({
        name: 'Demo User',
        email,
        password: 'Password123!',
        role: 'user',
        isVerified: true
      });
    } else {
      console.log('Updating existing demo user...');
      user.password = 'Password123!';
      user.isVerified = true;
    }

    await user.save();
    console.log('Demo user is ready. Email: demo@mynews.my, Password: Password123!');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixDemoUser();
