const { Pool } = require('pg');

// Safe configuration generator
const getPoolConfig = () => {
  try {
    if (process.env.DATABASE_URL) {
      return {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      };
    }
  } catch (e) {
    console.error('🔥 [DB CONFIG ERROR]: Malformed DATABASE_URL node.');
  }
  
  return {
    user: 'postgres',
    password: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    database: 'vidtube',
    ssl: false,
  };
};

let pool;

module.exports = {
  query: async (text, params) => {
    if (!pool) {
      pool = new Pool(getPoolConfig());
      console.log('--- Database Pool Initialized ---');
    }
    
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      console.error('🔥 [DATABASE ERROR]:', err.message);
      
      // Fallback logic for fresh instances
      if (err.message.includes('database "vidtube" does not exist')) {
        const sysPool = new Pool({ ...getPoolConfig(), database: 'postgres' });
        try {
          await sysPool.query('CREATE DATABASE vidtube');
          await sysPool.end();
          console.log('✅ Created vidtube DB on the fly.');
          return module.exports.query(text, params);
        } catch (sysErr) {
          console.error('🔥 [SYSTEM DB ERROR]:', sysErr.message);
          throw sysErr;
        }
      }
      throw err;
    }
  },
};
