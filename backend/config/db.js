const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if unreachable
    });
    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    console.error(`⚠️  MongoDB unavailable — history features disabled. Error: ${error.message}`);
    // Don't exit — news fetching still works without DB
  }
};

module.exports = connectDB;
