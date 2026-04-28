require('dotenv').config();
const key = process.env.OPENAI_API_KEY;
console.log('Key length:', key ? key.length : 'undefined');
console.log('Key start:', key ? key.substring(0, 7) : 'n/a');
console.log('Key end:', key ? key.substring(key.length - 4) : 'n/a');
console.log('Base URL:', process.env.OPENAI_BASE_URL);
