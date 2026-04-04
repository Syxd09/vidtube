const { Client } = require('pg');

async function check() {
  const variants = [
    { p: "#7619365978.Mh", db: 'postgres' },
    { p: 'postgres', db: 'postgres' },
    { p: '', db: 'postgres' }
  ];

  for (const v of variants) {
    console.log(`Testing [postgres user] on [postgres db] with [${v.p ? 'PWD' : 'EMPTY'}]`);
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: v.db,
      password: v.p,
      port: 5432,
    });
    try {
      await client.connect();
      console.log(`✅ SUCCESS! User postgres / DB postgres / Pwd: ${v.p}`);
      
      // Try to create vidtube if not exists
      try {
        await client.query('CREATE DATABASE vidtube');
        console.log('✅ Created vidtube database');
      } catch (dbErr) {
        if (dbErr.code === '42P04') console.log('✅ vidtube database already exists');
        else console.log(`❌ Create DB failed: ${dbErr.message}`);
      }

      await client.end();
      process.exit(0);
    } catch (e) {
      console.log(`❌ Failed: ${e.message}`);
    }
  }
}

check();
