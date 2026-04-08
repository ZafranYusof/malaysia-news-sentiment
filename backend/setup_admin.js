require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

const makeAdmin = async (email) => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log(`Connecting to: ${uri ? (uri.slice(0, 15) + '...') : 'NULL'}`);
    
    if (!uri) throw new Error('MONGODB_URI is missing from .env');

    await mongoose.connect(uri);
    console.log('Connected to Database.');

    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (!user) {
      console.log(`❌ ERROR: User [${email}] not found.`);
    } else {
      console.log(`✅ SUCCESS! User [${email}] is now an ADMIN.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ FATAL ERROR:', err.message);
    process.exit(1);
  }
};

const targetEmail = process.argv[2] || 'demo@mynews.my';
console.log(`Targeting user: ${targetEmail}`);
makeAdmin(targetEmail);
