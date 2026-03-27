const { Client } = require('pg');

const variants = [
  'postgres',
  '#7619365978.Mh',
  '123456',
  'admin',
  'password',
  ''
];

async function check() {
  for (const p of variants) {
    console.log(`Testing: ${p || '[EMPTY]'}`);
    const client = new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'postgres', // Connect to default DB
      password: p,
      port: 5432,
    });
    try {
      await client.connect();
      console.log(`✅ SUCCESS! Working password: "${p}"`);
      await client.end();
      process.exit(0);
    } catch (e) {
      console.log(`❌ Failed: ${e.message}`);
    }
  }
}

check();
