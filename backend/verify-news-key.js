const axios = require('axios');
const API_KEY = 'e066532dd60741eaa6ebc0e55ff1d05d';

async function verify() {
  console.log(`📡 PROBING TOP-HEADLINES WITH KEY: ${API_KEY.slice(0, 5)}...`);
  try {
    const res = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: { country: 'my', apiKey: API_KEY }
    });
    console.log('✅ TOP-HEADLINES IS VALID! Found:', res.data.totalResults, 'articles.');
  } catch (err) {
    if (err.response) {
      console.log(`❌ NEWSAPI REJECTED KEY: ${err.response.status}`);
      console.log('MESSAGE:', err.response.data.message);
    } else {
      console.log('❌ NETWORK ERROR:', err.message);
    }
  }
}

verify();
