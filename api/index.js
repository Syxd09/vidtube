const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../server/db');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'cortex-os',
  });
}

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this_later';

app.use(cors());
app.use(express.json());

// Security Headers: Resolve COOP blocks for OAuth popups
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Health Check Endpoint for Diagnostics
app.get('/api/health', async (req, res) => {
  const diagnostics = {
    status: 'online',
    version: 'v1.0.2-reliable-proxy',
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
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Schema migration: Add picture column if missing
    try {
      await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS picture TEXT;');
      await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;');
      console.log('✅ Users table schema verified');
    } catch (e) {
      console.log('ℹ️ PICTURE/ADMIN columns verification handled');
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
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, is_admin',
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
    res.json({ user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin }, token });
  } catch (err) {
    console.error('🔥 [AUTH ERROR] Login Failed:', err.message);
    res.status(500).json({ error: 'Internal Server Error (Login)' });
  }
});

// Google Login (Firebase)
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  console.log('[AUTH] Firebase Google Auth started');
  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(credential);
    const { email, name, picture } = decodedToken;
    console.log(`[AUTH] Firebase verified identity for ${email}`);

    // Intelligence Heartbeat: Ensure tables exist in the new database
    try {
      await db.query('SELECT id FROM users LIMIT 1');
    } catch (e) {
      console.log('⚠️ [SCHEMA PANIC] Tables missing. Triggering auto-provision sequence...');
      await initDB();
    }

    let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (result.rows.length === 0) {
      const insertResult = await db.query(
        'INSERT INTO users (name, email, password, picture) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
        [name, email, 'firebase_auth', picture]
      );
      user = insertResult.rows[0];
      console.log(`✅ [AUTH] New Firebase user registered: ${user.id}`);
    } else {
      user = result.rows[0];
      await db.query('UPDATE users SET picture = $1 WHERE id = $2', [picture, user.id]);
      console.log(`✅ [AUTH] Firebase session synchronized for user: ${user.id}`);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, picture, is_admin: user.is_admin }, token });
  } catch (err) {
    console.error('🔥 [AUTH ERROR] Firebase Verification Failed:', err.message);
    res.status(401).json({ 
      error: 'Google authentication failed', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
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

// --- YouTube Proxy Routes ---

async function fetchYoutubeWithRetry(url, retries = 2) {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  ];
  
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (resp.ok) return await resp.text();
      if (resp.status === 429) {
        await new Promise(r => setTimeout(r, 1500 * (i + 1)));
        continue;
      }
      throw new Error(`YouTube status ${resp.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
}

function extractJsonFromHtml(html, key) {
  const regex = new RegExp(`${key}\\s*=\\s*({.+?});`, 's');
  const match = html.match(regex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      // Find the end of the JSON object more carefully if simple regex fails
      try {
        let depth = 0;
        let start = html.indexOf(`${key} = {`) + key.length + 3;
        for (let i = start; i < html.length; i++) {
          if (html[i] === '{') depth++;
          if (html[i] === '}') {
            if (depth === 0) return JSON.parse(html.substring(start, i + 1));
            depth--;
          }
        }
      } catch (e2) { /* ignore */ }
    }
  }
  return null;
}

app.get('/api/youtube/metadata/:videoId', async (req, res) => {
  const { videoId } = req.params;
  try {
    const html = await fetchYoutubeWithRetry(`https://www.youtube.com/watch?v=${videoId}`);
    const playerResponse = extractJsonFromHtml(html, 'ytInitialPlayerResponse');
    
    if (playerResponse?.videoDetails) {
      const details = playerResponse.videoDetails;
      return res.json({
        title: details.title,
        authorName: details.author,
        views: parseInt(details.viewCount || '0').toLocaleString(),
        publishDate: playerResponse.microformat?.playerMicroformatRenderer?.publishDate
      });
    }

    // Heuristic fallback
    const title = html.match(/<meta name="title" content="(.*?)">/)?.[1] || 
                  html.match(/<title>(.*?) - YouTube<\/title>/)?.[1] || 
                  'Untitled Video';
    res.json({ title });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

app.get('/api/youtube/transcript/:videoId', async (req, res) => {
  const { videoId } = req.params;
  try {
    const html = await fetchYoutubeWithRetry(`https://www.youtube.com/watch?v=${videoId}`);
    
    // Strategy 1: ytInitialPlayerResponse
    const playerResponse = extractJsonFromHtml(html, 'ytInitialPlayerResponse');
    let captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    // Strategy 2: Heuristic regex for captionTracks
    if (!captionTracks) {
      const trackRegex = /"captionTracks":\s*(\[.*?\])/;
      const trackMatch = html.match(trackRegex);
      if (trackMatch) {
        try { captionTracks = JSON.parse(trackMatch[1]); } catch (e) {}
      }
    }

    if (captionTracks && Array.isArray(captionTracks)) {
      const track = captionTracks.find(t => t.languageCode === 'en' || t.languageCode.startsWith('en')) || captionTracks[0];
      if (track && track.baseUrl) {
        const xml = await fetchYoutubeWithRetry(track.baseUrl);
        const entries = [];
        const entryRegex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>(.*?)<\/text>/g;
        let entryMatch;
        while ((entryMatch = entryRegex.exec(xml)) !== null) {
          entries.push({
            start: parseFloat(entryMatch[1]),
            duration: parseFloat(entryMatch[2]),
            text: entryMatch[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
          });
        }
        if (entries.length > 0) return res.json(entries);
      }
    }
    
    res.status(404).json({ error: 'No captions available' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transcript' });
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

// --- Admin Routes ---

app.get('/api/admin/users', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Simple admin check: Check if email is in admin list or has is_admin flag
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = userResult.rows[0];
    
    if (!user || (!user.is_admin && user.email !== 'syedmatheen.dev@gmail.com')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const allUsers = await db.query('SELECT id, name, email, picture, is_admin, created_at FROM users ORDER BY created_at DESC');
    res.json(allUsers.rows);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// --- AI Proxy Routes (Whisper & ElevenLabs) ---
const multer = require('multer');
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB limit for Whisper

app.post('/api/ai/transcribe', upload.single('file'), async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Whisper API key not configured' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', blob, 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Transcription failed');

    res.json(data);
  } catch (err) {
    console.error('🔥 [WHISPER ERROR]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/dub', async (req, res) => {
  // ElevenLabs integration
  res.status(501).json({ error: 'ElevenLabs integration in progress' });
});

// Tactical Environment Diagnostic Node (Protected)
app.get('/api/debug-env', (req, res) => {
  const dbUrl = process.env.DATABASE_URL || '';
  const hostMatch = dbUrl.match(/@([^:/]+)/);
  const host = hostMatch ? hostMatch[1] : 'none';
  
  res.json({
    status: 'diagnostic_active',
    has_db_url: !!dbUrl,
    db_url_length: dbUrl.length,
    host_preview: host.substring(0, 5) + '...',
    node_env: process.env.NODE_ENV,
    is_vercel: !!process.env.VERCEL
  });
});

// Original initialization logic (reverted to system baseline)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  initDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`--- Workspace Intelligence Engine active on port ${PORT} ---`);
  });
}

// Export for Vercel
module.exports = app;
