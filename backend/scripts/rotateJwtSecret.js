const fs   = require('fs');
const path = require('path');

const {
  randomBytes,
} = require('node:crypto');

const buf = randomBytes(64);
console.log(
  `${buf.length} bytes of random data: ${buf.toString('hex')}`);

const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(
  envPath,
  fs.readFileSync(envPath, 'utf8').replace(
    /^JWT_SECRET=.*/m,
    `JWT_SECRET=${buf.toString('hex')}`
  )
);

console.log('JWT secret rotated successfully.');
console.log('All active sessions have been invalidated.');
console.log('Restart the server to apply the new secret.');