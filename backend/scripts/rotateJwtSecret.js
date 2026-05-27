const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

const newSecret = crypto.randomBytes(64).toString('hex');

let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(/^JWT_SECRET=.*/m, `JWT_SECRET=${newSecret}`);
fs.writeFileSync(envPath, envContent);

console.log('JWT secret rotated successfully.');
console.log('All active sessions have been invalidated.');
console.log('Restart the server to apply the new secret.');
