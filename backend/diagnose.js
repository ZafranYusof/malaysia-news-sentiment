require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testConnectivity() {
  console.log('--- Connectivity Diagnostic ---');

  // 1. Google/Firebase Connectivity
  try {
    const res = await axios.get('https://www.googleapis.com/generate_204');
    console.log('✅ Google APIs: Reachable');
  } catch (e) {
    console.error('❌ Google APIs: Unreachable', e.message);
  }

  // 2. Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Hi');
      console.log('✅ Gemini API: Working');
    } catch (e) {
      console.error('❌ Gemini API: Failed', e.message);
    }
  } else {
    console.log('⚠️ Gemini API: No key provided');
  }

  // 3. MongoDB Atlas
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ MongoDB: Connected');
      await mongoose.disconnect();
    } catch (e) {
      console.error('❌ MongoDB: Failed', e.message);
      if (e.message.includes('SSL')) {
        console.log('   TIP: This looks like an SSL issue. Check if your firewall blocks port 27017 or if you are on a restricted network.');
      }
    }
  }

  console.log('-------------------------------');
}

testConnectivity();
