const crypto = require('crypto');

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString('hex');
  return secretKey;
};

// Generate and log the secret key
const secretKey = generateSecretKey();
console.log('Generated Secret Key:', secretKey);
