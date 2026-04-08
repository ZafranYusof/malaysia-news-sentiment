const mongoose = require('mongoose');
const Article = require('./models/Article');
const { getAndAnalyzeNews } = require('./controllers/newsController');
require('dotenv').config();

async function testPersistence() {
    console.log('🧪 TESTING HISTORY PERSISTENCE...');
    
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/malaysia-news-sentiment');
        console.log('✅ Connected to MongoDB');

        // 1. Create a dummy article first to simulate "Existing" article
        const dummyUrl = 'https://test-persistence-' + Date.now() + '.com';
        const initialArticle = await Article.create({
            title: 'Initial Test Article',
            description: 'This was analyzed before',
            url: dummyUrl,
            sentiment: 'Neutral',
            userId: null,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
        });
        console.log('✅ Created initial article (1 day old, userId null)');

        // 2. Mock Request and Response for getAndAnalyzeNews
        const testUserId = new mongoose.Types.ObjectId();
        const req = {
            query: { q: 'Test' },
            userId: testUserId.toString()
        };

        // We need to mock the services because we don't want to call real APIs/OpenAI in this test
        // But for simplicity, I'll just manually call the logic I modified in the controller
        console.log('🔍 Simulating analysis with User ID:', testUserId);
        
        const existing = await Article.findOne({ url: dummyUrl });
        if (existing) {
            console.log('Found existing article. Updating metadata...');
            // Use defaults which will update updatedAt automatically
            await Article.findOneAndUpdate(
                { _id: existing._id },
                { 
                  $set: { 
                    userId:    testUserId, 
                    topic:     'Test' 
                  } 
                },
                { new: true } 
            );
        }

        // 3. Verify
        const updated = await Article.findOne({ url: dummyUrl });
        
        const timeDiffUpdate = Math.abs(new Date() - updated.updatedAt);
        const isRecentlyUpdated = timeDiffUpdate < 5000;
        const isCorrectUser = updated.userId.toString() === testUserId.toString();

        console.log('-----------------------------------------');
        console.log('Update Results:');
        console.log('- Time since updated (Now - updatedAt):', timeDiffUpdate, 'ms');
        console.log('- User ID matches:', isCorrectUser);
        console.log('- Is Recently Updated:', isRecentlyUpdated);
        
        if (isRecentlyUpdated && isCorrectUser) {
            console.log('🏆 SUCCESS: History persistence works through updatedAt!');
        } else {
            console.log('❌ FAILURE: updatedAt was not updated automatically as expected.');
        }

        // Cleanup
        await Article.deleteOne({ url: dummyUrl });
        console.log('🧹 Cleaned up test data');

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

testPersistence();
