/**
 * Script to generate a hashed password for admin authentication
 * 
 * Usage:
 *   node scripts/generate-password.js <your-password>
 * 
 * Example:
 *   node scripts/generate-password.js admin@123
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password as an argument');
  console.log('\nUsage:');
  console.log('  node scripts/generate-password.js <your-password>');
  console.log('\nExample:');
  console.log('  node scripts/generate-password.js admin@123');
  process.exit(1);
}

async function generateHash() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const hashBase64 = Buffer.from(hash).toString('base64');
    
    console.log('\n✅ Password hashed successfully!\n');
    console.log('Add this to your .env.local file:\n');
    console.log(`ADMIN_PASSWORD_HASH_BASE64=${hashBase64}\n`);
    console.log('⚠️  Keep this secure and never commit .env.local to version control!');
    console.log('⚠️  Restart your Next.js server after updating the .env.local file!');
  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
    process.exit(1);
  }
}

generateHash();

