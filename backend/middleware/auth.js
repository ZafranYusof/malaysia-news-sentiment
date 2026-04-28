const jwt = require('jsonwebtoken');

// Security #7: No fallback — server.js already exits if JWT_SECRET is missing.
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// Sign a token — includes role so authorize() never needs a DB lookup.
// Performance #14: role in payload = zero extra DB queries per protected request.
const signToken = (userId, role = 'user') =>
  jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// Middleware: protect routes
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId   = decoded.id;
    req.userRole = decoded.role || 'user'; // surfaced from JWT — no DB needed
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};

// Middleware: restrict to specific roles (synchronous — reads from JWT payload).
// Performance #14: Removed async DB fetch; role is already in req.userRole from protect().
const authorize = (...roles) => (req, res, next) => {
  if (!req.userRole || !roles.includes(req.userRole)) {
    return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
  }
  next();
};

module.exports = { signToken, protect, authorize };
