const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mynews_super_secret_key_2026';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// Sign a token
const signToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// Middleware: protect routes
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};

module.exports = { signToken, protect };
