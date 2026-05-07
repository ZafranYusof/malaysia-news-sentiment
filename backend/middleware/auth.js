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
    req.userRole = decoded.role || 'user';
    req.isGuest  = decoded.isGuest || false;
    // Set req.user for all users (controllers use req.user._id and req.user?.id)
    if (decoded.isGuest) {
      req.user = { _id: 'guest', id: 'guest', name: 'Guest User', role: 'guest', isGuest: true };
    } else {
      req.user = { _id: decoded.id, id: decoded.id, role: decoded.role || 'user' };
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};

// Middleware: block guest users from write operations
const blockGuest = (req, res, next) => {
  if (req.isGuest) {
    return res.status(403).json({ error: 'Guest users cannot perform this action. Please create an account.' });
  }
  next();
};

// Middleware: restrict to specific roles (synchronous — reads from JWT payload).
// Performance #14: Removed async DB fetch; role is already in req.userRole from protect().
const authorize = (...roles) => (req, res, next) => {
  if (!req.userRole || !roles.includes(req.userRole)) {
    return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
  }
  next();
};

// Sign a guest token (limited access, no DB user)
const signGuestToken = () =>
  jwt.sign({ id: 'guest', role: 'guest', isGuest: true }, JWT_SECRET, { expiresIn: '24h' });

module.exports = { signToken, signGuestToken, protect, blockGuest, authorize };
