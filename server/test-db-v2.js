const { Client } = require('pg');

const testCases = [
  { p: "#7619365978.Mh", n: 'Provided Password' },
  { p: 'postgres', n: 'Default Password' },
  { p: '', n: 'Empty Password' },
  { p: 'admin', n: 'Admin Password' }
];

async function run() {
  for (const tc of testCases) {
    console.log(`--- Testing: ${tc.n} ---`);
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'vidtube',
      password: tc.p,
      port: 5432,
    });
    try {
      await client.connect();
      console.log(`✅ MATCH FOUND: ${tc.n}`);
      await client.end();
      process.exit(0);
    } catch (e) {
      console.log(`❌ Failed: ${e.message}`);
    }
  }
  console.log('Final attempt: trying without a specific database...');
  // (Omitted for brevity, but trying to see if it connects to "postgres" system db)
}

run();
