const { Client } = require('pg');

const config = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
} : {
  user: 'postgres',
  password: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  database: 'vidtube',
  ssl: false,
};

module.exports = {
  query: async (text, params) => {
    const client = new Client(config);
    try {
      await client.connect();
      const res = await client.query(text, params);
      await client.end();
      return res;
    } catch (err) {
      console.error('🔥 Query Error:', err.message);
      // Fallback to system db if vidtube doesn't exist
      if (err.message.includes('database "vidtube" does not exist')) {
         const sysClient = new Client({ ...config, database: 'postgres' });
         try {
           await sysClient.connect();
           await sysClient.query('CREATE DATABASE vidtube');
           await sysClient.end();
           console.log('✅ Created vidtube DB on the fly.');
           // Recurse once
           return module.exports.query(text, params);
         } catch (sysErr) {
           throw sysErr;
         }
      }
      throw err;
    }
  },
};
