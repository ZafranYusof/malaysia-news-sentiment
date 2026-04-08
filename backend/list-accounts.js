const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const listAllUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}, 'name email role');
        console.log('--- REGISTERED ACCOUNTS ---');
        if (users.length === 0) {
            console.log('No users found in database.');
        } else {
            users.forEach((u, i) => {
                console.log(`[${i+1}] Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
            });
        }
    } catch (err) {
        console.error('Error fetching users:', err.message);
    } finally {
        process.exit(0);
    }
};

listAllUsers();
