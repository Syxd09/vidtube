const { Client } = require('pg');
require('dotenv').config();

const passwords = [
  process.env.DB_PASSWORD,
  "#7619365978.Mh",
  "postgres",
  ""
];

async function test() {
  for (const pwd of passwords) {
    console.log(`Testing with password: ${pwd ? 'PROVIDED' : 'EMPTY'}`);
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'vidtube',
      password: pwd,
      port: 5432,
    });
    try {
      await client.connect();
      console.log('✅ SUCCESS! Password is valid.');
      await client.end();
      return;
    } catch (e) {
      console.log(`❌ FAILED: ${e.message}`);
    }
  }
}

test();
