const { fetchMalaysiakiniNews } = require('./backend/services/malaysiakiniService');

async function test() {
    console.log('Fetching Malaysiakini news...');
    const news = await fetchMalaysiakiniNews();
    console.log(`Found ${news.length} articles.`);
    if (news.length > 0) {
        console.log('First article:', news[0].title);
        console.log('URL:', news[0].url);
    }
}

test();
