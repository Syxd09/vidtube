const { Client } = require('pg');

const pwd = '#7619365978.Mh';

async function test() {
  console.log('Testing with provided password EXACTLY...');
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'vidtube',
    password: pwd,
    port: 5432,
  });
  try {
    await client.connect();
    console.log('✅ SUCCESS! Connection established with #7619365978.Mh');
    await client.end();
  } catch (e) {
    console.log(`❌ FAILED: ${e.message}`);
  }
}

test();
