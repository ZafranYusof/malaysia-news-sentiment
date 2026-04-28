require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There isn't a direct listModels in the standard generative-ai package 
    // without using the specialized rest client, but we can try common ones.
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent('Hi');
            console.log(`✅ ${m} is available and working.`);
        } catch (e) {
            console.log(`❌ ${m} failed: ${e.message}`);
        }
    }
  } catch (e) {
    console.error('List error:', e.message);
  }
}

listModels();
