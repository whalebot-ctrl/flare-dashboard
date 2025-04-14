import crypto from 'crypto';

// Generate a random 64-character hex string
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('Your JWT Secret:');
console.log(jwtSecret);
console.log('\nAdd this to your .env file:');
console.log(`JWT_SECRET=${jwtSecret}`);
