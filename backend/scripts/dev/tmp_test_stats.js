const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Article = require('../../models/Article');
const User = require('../../models/User');

async function testStats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    const now = new Date();
    const match = {}; // for global stats
    
    const user = await User.findOne();
    const userId = user ? user._id : null;
    
    console.log('Testing Global Stats...');
    const [globalSentiments, globalAlerts] = await Promise.all([
      Article.aggregate([
        { $match: match },
        { $group: { _id: '$sentiment', count: { $sum: 1 } } },
      ]),
      Article.countDocuments({ ...match, isAlert: true }),
    ]);
    console.log('Global results:', { sentiments: globalSentiments, alerts: globalAlerts });

    if (userId) {
      console.log('Testing User Stats for', user.name);
      const userMatch = { userId };
      const [uSentiments, uAlerts] = await Promise.all([
        Article.aggregate([
          { $match: userMatch },
          { $group: { _id: '$sentiment', count: { $sum: 1 } } },
        ]),
        Article.countDocuments({ ...userMatch, isAlert: true }),
      ]);
      console.log('User results:', { sentiments: uSentiments, alerts: uAlerts });
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testStats();
