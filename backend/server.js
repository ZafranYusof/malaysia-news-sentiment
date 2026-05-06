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

// ── API Metrics Tracking ──────────────────────────────────────
const apiMetrics = {
  totalCalls: 0,
  endpoints: {},
  methods: { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0 },
  statusCodes: {},
  avgResponseTime: 0,
  responseTimes: [],
  startedAt: new Date(),
  hourly: {},
  errors: 0,
};

app.use((req, res, next) => {
  req.startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const route = req.route?.path || req.path;
    const key = `${req.method} ${route}`;
    
    apiMetrics.totalCalls++;
    apiMetrics.methods[req.method] = (apiMetrics.methods[req.method] || 0) + 1;
    apiMetrics.statusCodes[res.statusCode] = (apiMetrics.statusCodes[res.statusCode] || 0) + 1;
    apiMetrics.endpoints[key] = (apiMetrics.endpoints[key] || 0) + 1;
    
    if (res.statusCode >= 400) apiMetrics.errors++;
    
    apiMetrics.responseTimes.push(duration);
    if (apiMetrics.responseTimes.length > 500) apiMetrics.responseTimes.shift();
    apiMetrics.avgResponseTime = Math.round(apiMetrics.responseTimes.reduce((a, b) => a + b, 0) / apiMetrics.responseTimes.length);
    
    const hour = new Date().getHours();
    apiMetrics.hourly[hour] = (apiMetrics.hourly[hour] || 0) + 1;
  });
  
  next();
});

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost',
  'https://localhost',
  'capacitor://localhost',
  'ionic://localhost',
  'http://192.168.188.214:5173',
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'production') {
      // In production, allow all origins for mobile app compatibility
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

// ── API Metrics Endpoint (after CORS) ───────────────────
app.get('/api/v1/admin/metrics', (req, res) => {
  const topEndpoints = Object.entries(apiMetrics.endpoints)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([endpoint, count]) => ({ endpoint, count }));
  const uptimeMs = Date.now() - apiMetrics.startedAt.getTime();
  const uptimeHours = Math.floor(uptimeMs / 3600000);
  const uptimeMins = Math.floor((uptimeMs % 3600000) / 60000);
  res.json({
    totalCalls: apiMetrics.totalCalls,
    methods: apiMetrics.methods,
    statusCodes: apiMetrics.statusCodes,
    avgResponseTime: apiMetrics.avgResponseTime,
    topEndpoints,
    errors: apiMetrics.errors,
    errorRate: apiMetrics.totalCalls ? ((apiMetrics.errors / apiMetrics.totalCalls) * 100).toFixed(2) : '0.00',
    uptime: `${uptimeHours}h ${uptimeMins}m`,
    startedAt: apiMetrics.startedAt,
    requestsPerMinute: apiMetrics.totalCalls > 0 ? (apiMetrics.totalCalls / (uptimeMs / 60000)).toFixed(1) : '0.0',
    hourlyDistribution: apiMetrics.hourly,
  });
});

// ── Routes (v1) ───────────────────────────────────────────────
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/news', require('./routes/newsRoutes'));
app.use('/api/v1/history', require('./routes/historyRoutes'));

// ── New feature routes ────────────────────────────────────────
app.use('/api/v1/entities', require('./routes/entityRoutes'));
app.use('/api/v1/sources', require('./routes/sourceRoutes'));
app.use('/api/v1/feed', require('./routes/feedRoutes'));
app.use('/api/v1/alerts', require('./routes/alertRoutes'));
app.use('/api/v1/credibility', require('./routes/credibilityRoutes'));

// ── Backward compatibility — old routes redirect to v1 ───────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/entities', require('./routes/entityRoutes'));
app.use('/api/sources', require('./routes/sourceRoutes'));
app.use('/api/feed', require('./routes/feedRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/credibility', require('./routes/credibilityRoutes'));
// Metrics backward compat
app.get('/api/admin/metrics', (req, res) => res.redirect('/api/v1/admin/metrics'));
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

// ── Socket.io Authentication Middleware ────────────────────
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    // Allow unauthenticated connections for public features (analysis progress)
    // but mark them as guest
    socket.userId = null;
    socket.isGuest = true;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role || 'user';
    socket.isGuest = false;
    next();
  } catch (err) {
    socket.userId = null;
    socket.isGuest = true;
    next(); // Allow connection but as guest
  }
});

// Make io accessible to controllers via app.set
app.set('io', io);

io.on('connection', (socket) => {
  const userType = socket.isGuest ? 'Guest' : `User:${socket.userId}`;
  console.log(`🔌 ${userType} connected: ${socket.id}`);
  
  // Join user-specific room for targeted events
  if (socket.userId) {
    socket.join(`user:${socket.userId}`);
  }
  
  socket.on('disconnect', () => {
    console.log(`❌ ${userType} disconnected: ${socket.id}`);
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
