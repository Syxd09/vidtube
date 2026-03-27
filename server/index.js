const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this_later';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

// Health Check Endpoint for Diagnostics
app.get('/api/health', async (req, res) => {
  const diagnostics = {
    status: 'online',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DB_CONFIGURED: !!process.env.DATABASE_URL,
      GOOGLE_AUTH_CONFIGURED: !!process.env.GOOGLE_CLIENT_ID,
      JWT_CONFIGURED: !!process.env.JWT_SECRET,
    }
  };
  
  try {
    const dbTest = await db.query('SELECT NOW()');
    diagnostics.database = { status: 'connected', time: dbTest.rows[0].now };
    res.json(diagnostics);
  } catch (err) {
    diagnostics.database = { status: 'error', message: err.message };
    console.error('🔥 [HEALTH CHECK ERROR]:', err.message);
    res.status(500).json(diagnostics);
  }
});

// Database initialization
async function initDB() {
  console.log('--- Initializing Database ---');
  try {
    await db.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');
    
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Schema migration: Add picture column if missing
    try {
      await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS picture TEXT;');
      console.log('✅ Users table schema verified');
    } catch (e) {
      console.log('ℹ️ Picture column already exists or skipped');
    }

    // Create summaries table
    await db.query(`
      CREATE TABLE IF NOT EXISTS summaries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        video_id TEXT,
        title TEXT,
        author_name TEXT,
        thumbnail TEXT,
        summary TEXT,
        overview TEXT,
        sentiment TEXT,
        views TEXT,
        publish_date TEXT,
        key_points JSONB,
        transcript JSONB,
        tags JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Database schema fully verified');
  } catch (err) {
    console.error('🔥 CRITICAL DB Initialization Error:', err.message);
  }
}

// initDB is now handled only in local dev mode or via setup-db.js
// initDB();

// --- Authentication Routes ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log(`[AUTH] Signup attempt for ${email}`);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`✅ [AUTH] User created: ${user.id}`);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('🔥 [AUTH ERROR] Signup Failed:', err.message);
    if (err.code === '23505') {
       return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('🔥 [AUTH ERROR] Signup Failed:', err.message);
    res.status(500).json({ 
      error: 'Internal Server Error (Signup)', 
      details: err.message,
      fix: !process.env.DATABASE_URL ? 'URGENT: DATABASE_URL is missing in Vercel Environment Variables.' : 'Ensure you have run `npm run setup-db` to create your tables.'
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Login attempt for ${email}`);
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.warn(`[AUTH] Login failed: User not found (${email})`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[AUTH] Login failed: Wrong password (${email})`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`✅ [AUTH] Login successful: ${user.id}`);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error('🔥 [AUTH ERROR] Login Failed:', err.message);
    res.status(500).json({ error: 'Internal Server Error (Login)' });
  }
});

// Google Login
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  console.log('[AUTH] Google Auth Synchronization sequence started');
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    console.log(`[AUTH] Verifying identity for ${email}`);

    let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (result.rows.length === 0) {
      const insertResult = await db.query(
        'INSERT INTO users (name, email, password, picture) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
        [name, email, 'google_auth_placeholder', picture]
      );
      user = insertResult.rows[0];
      console.log(`✅ [AUTH] New Google user registered: ${user.id}`);
    } else {
      user = result.rows[0];
      // Update picture if needed
      await db.query('UPDATE users SET picture = $1 WHERE id = $2', [picture, user.id]);
      console.log(`✅ [AUTH] Google session synchronized for user: ${user.id}`);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, picture }, token });
  } catch (err) {
    const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    console.error('🔥 [AUTH ERROR] Google Verification Failed:', err.message);
    res.status(401).json({ 
      error: 'Google authentication failed', 
      details: err.message,
      env_check: {
        GOOGLE_CLIENT_ID_PRESENT: !!process.env.GOOGLE_CLIENT_ID,
        NODE_ENV: process.env.NODE_ENV
      },
      tip: !process.env.GOOGLE_CLIENT_ID ? 'You MUST add GOOGLE_CLIENT_ID to your Vercel Environment Variables.' : 'Check Google OAuth Authorized Origins.'
    });
  }
});

// --- Summaries Routes ---

app.get('/api/summaries', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await db.query('SELECT * FROM summaries WHERE user_id = $1 ORDER BY created_at DESC', [decoded.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/api/summaries', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { video_id, title, author_name, thumbnail, summary, key_points, transcript, tags, overview, sentiment, views, publish_date } = req.body;
    
    const result = await db.query(
      `INSERT INTO summaries 
       (user_id, video_id, title, author_name, thumbnail, summary, key_points, transcript, tags, overview, sentiment, views, publish_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [decoded.id, video_id, title, author_name, thumbnail, summary, JSON.stringify(key_points), JSON.stringify(transcript), JSON.stringify(tags), overview, sentiment, views, publish_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('🔥 [SUMMARIES ERROR] Failed to save:', err.message);
    res.status(500).json({ error: 'Failed to save summary' });
  }
});

app.delete('/api/summaries/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await db.query('DELETE FROM summaries WHERE id = $1 AND user_id = $2', [req.params.id, decoded.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('🔥 [SUMMARIES ERROR] Failed to delete:', err.message);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Only auto-initialize in development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  initDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`--- Workspace Intelligence Engine active on port ${PORT} ---`);
  });
}

// Export for Vercel
module.exports = app;
