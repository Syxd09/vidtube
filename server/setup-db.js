const fs = require('fs');
const path = require('path');
const db = require('./db');

async function setup() {
  console.log('--- VidTube AI Database Setup ---');
  try {
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema.sql...');
    await db.query(schema);
    console.log('✅ Database tables created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error setting up database:');
    console.error(err.message);
    if (err.message.includes('auth_failed')) {
      console.error('\nTIP: Please check your DATABASE_URL in server/.env and make sure the password is correct.');
    }
    process.exit(1);
  }
}

setup();
