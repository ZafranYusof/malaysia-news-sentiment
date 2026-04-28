const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../.env');
let envContent = fs.readFileSync(envPath, 'utf8');

const serviceAccount = {
  "type": "service_account",
  "project_id": "malaysisentimentdashboard",
  "private_key_id": "e6699dc2d06acf65d29979e3a8046039f80c4aa9",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQD4pbrNbTvyuK7l\nT7xNJRmhaxKQ/cgUL/lkmjNYEy436cKkcK/dyrEsnagF2+vABlsJ2ZM3t19AoDO9\nwjGam7y+EWHqPPz3+n0Jz9w+BccWrv0h+ctxzuwsvmdMy5aFm+45LlWcM1KxYLLs\ngdS7iWB8ognND1xbjbMxJCcNZ5XpJZvnTYh3IGGzkWe7ePOVx/67bV7dkwPBQsQ6\n1Xm7mRSstIZfRSHLM5h+dGSjLv+ARw0ZGXAskvZHQ/AZKzX/relYg7ln7u3uszaD\ndw6mSp2wsAHjmVfPi4QwcEij4LgYZdxtibiYw6Z2Gn3yfzZ2u0hdgykJREHH/j6c\ndZEXZh/5AgMBAAECggEANWOgkKt7y8pMA4Dzdb0Zm8dZ3Tgg1fTXH/rcO3Ui326a\nFKT9nin/kQzpHxjxrfGvapYFPllpYn8DnSMtc30tMcKZu6oMx1JJtumi6M5kyUIZ\nqEnynSVJIPJhS+QLFfU9WZnRWBDNGLkishXOj9YXmatRX26E7kOmzk5s9DvhvIWi\ncNT4EeyN3P18HIqQo0IPVUjm+yb6nGPsCVQk5VZNm2lFpRuP8zM6dV8ilKGMros2\n71BplG2VEbcYKpzNdYO+ASnOOJLMjYtPodo7s5vmKY5na7EKUAKQ0lvZyRbajW5A\nY7WZgKy6X7om/Ywejv8ONuDAjteY73kqRPlnLedMYQKBgQD/rrgUVyE1VhGS1j0E\nQ0KgBDWAZs1AKzTBLt9a2e316XpSM4JkwivKF2SBTXSsPMDonwwNsC+AHkV3N93H\n8SQOdGWVHStE+WaoIbQ5NVx/RDzzfUtNVo9qJSX8xKmwmU9W7W7gn0aYAr7LAygB\nRjHLUY0PzcF/Z1cm0RFbK3ILfwKBgQD49MYxMq/cACYpH+jiaL01imNz22A4PueV\nEhIYmLIyq4ZyMwP+HOlJOaAdxbdj/7SdX0kJ6UP/j2Bib7FppgVaJZzqeHHGWbjj\nItrkUz9xIpQ4kTrdxgfgB9uc2Kd2m+PExf/TDsTleT4toNbqLmW8ryCbDx58+SM0\nWoiE9gXwhwKBgQDMRkM7vQEDI+iWcCP/q90nCzXTiE6j3eEgFtrMMyEzP35C/nRH\nG/rwUxAxXjjBAyj8sVVn+kN5ELZfMXs3qykrg0NFhzBywu+JlKPwsPldlJ89yfTH\nrUiXfWaENHt+ZH5G7RuQyrAT8t2MRNFJc1OFJXqWDcVyjJXMpWxAcs2C8QKBgQDR\nqYsUOeTC+dkpfzcpHh5i7dZN5y4EkG2GLL7Suh4w8CV9HZu6MW0CfyZqjG2jKOFa\nO7oOP8ZFfuEkZX5bRDdzsQOSr7bZ3gwINf10lutyAzYi4aRay4EsWlHIqOl3yVes\nCzgk7mZB/7auxKradBK4MiDalYQOqd7NI4WfvHZKFwKBgQCffYvewz1ju8ll2xbL\nQfE6bPWhqHbr+yLMoQfaAsF2SgU3WgJVOwFQQ6w29E53XM3t+R9wiUwgo2BPq3h1\nLASyUR4kcZ/MGEIDg4d1Hnoo7wdCrrovAzqDHLJqvol9W/UqrZovc2EXAgVJLfdo\nRRBk5bobpNoE65HSUBuyKpcXYA==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@malaysisentimentdashboard.iam.gserviceaccount.com",
  "client_id": "116739688437790734372",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40malaysisentimentdashboard.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

const jsonStr = JSON.stringify(serviceAccount);
// We want it to be stored properly in dotenv. Usually just FIREBASE_SERVICE_ACCOUNT_JSON='{...}' is fine without mutating the \n characters.
let regex = /^FIREBASE_SERVICE_ACCOUNT_JSON=.*$/m;
let replacement = `FIREBASE_SERVICE_ACCOUNT_JSON='${jsonStr}'`;

if (envContent.match(regex)) {
  envContent = envContent.replace(regex, replacement);
} else {
  envContent += `\n${replacement}\n`;
}

fs.writeFileSync(envPath, envContent);
console.log('Fixed .env');
