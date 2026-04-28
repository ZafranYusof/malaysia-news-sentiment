const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

async function testAstro() {
  try {
    const url = 'https://www.astroawani.com/rss/latest/public';
    console.log('Fetching', url);
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const parser = new XMLParser({
      ignoreAttributes: false
    });
    const jsonObj = parser.parse(response.data);
    
    console.log('JSON Structure (summary):');
    if (jsonObj.rss) {
      const channel = jsonObj.rss.channel;
      console.log('Channel Title:', channel.title);
      const items = channel.item;
      console.log('Is array?', Array.isArray(items));
      console.log('Items Count:', Array.isArray(items) ? items.length : (items ? 1 : 0));
      
      if (Array.isArray(items) && items.length > 0) {
        console.log('First Item title:', items[0].title);
        console.log('First Item keys:', Object.keys(items[0]));
      } else if (items) {
        console.log('Single Item title:', items.title);
      }
    } else {
      console.log('No RSS root found.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAstro();
