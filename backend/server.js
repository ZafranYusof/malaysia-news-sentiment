const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const connectDB = require('./config/db');

// ── Load env FIRST ────────────────────────────────────────────
dotenv.config();

// ── Environment validation (#19) ──────────────────────────────
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const MISSING = REQUIRED_ENV.filter(k => !process.env[k]);
if (MISSING.length) {
  console.error(`❌ Missing required environment variables: ${MISSING.join(', ')}`);
  console.error('   Please check your backend/.env file.');
  process.exit(1);
}

// Warn about optional but recommended vars

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

// ── HTTP Security Headers (Security #23) ─────────────────────
app.use(helmet());

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));

// ── Rate limiting ─────────────────────────────────────────────
// Rate limiters disabled for development/testing as requested


// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Make io accessible to controllers via app.set
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ── Newsletter Scheduler ───────────────────────────────────
const { scheduleNewsletter } = require('./services/newsletterService');

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('   Real-time: Socket.io Enabled');
  scheduleNewsletter();
});
