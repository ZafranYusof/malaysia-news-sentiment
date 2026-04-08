const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const connectDB = require('./config/db');

// ── Load env FIRST ────────────────────────────────────────────
dotenv.config();

// ── Environment validation (#19) ──────────────────────────────
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET', 'NEWS_API_KEY'];
const MISSING = REQUIRED_ENV.filter(k => !process.env[k]);
if (MISSING.length) {
  console.error(`❌ Missing required environment variables: ${MISSING.join(', ')}`);
  console.error('   Please check your backend/.env file.');
  process.exit(1);
}

// Warn about optional but recommended vars
if (!process.env.WORLD_NEWS_API_KEY || process.env.WORLD_NEWS_API_KEY.includes('your_')) {
  console.warn('⚠️  WORLD_NEWS_API_KEY not set — multi-source news will be limited to NewsAPI.');
}
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_')) {
  console.warn('⚠️  OPENAI_API_KEY not set — falling back to local sentiment analysis.');
}

// ── Connect to MongoDB ────────────────────────────────────────
connectDB();

const app = express();

// ── Timing Middleware (#Admin Telemetry) ──────────────────────
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));

// ── Session (for OAuth flows) ─────────────────────────────────
app.use(session({
  secret: process.env.JWT_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 },
}));

// ── Rate limiting (#5) ────────────────────────────────────────
// Disabled for development/testing ease
/*
app.use('/api/news', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      30,
  message:  { error: 'Too many requests. Please wait a few minutes before searching again.' },
  standardHeaders: true,
  legacyHeaders:   false,
}));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  message:  { error: 'Too many API requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders:   false,
}));
*/

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🇲🇾 Malaysian News Sentiment API',
    status: 'running',
    version: '2.0.0',
    time: new Date().toISOString(),
  });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
