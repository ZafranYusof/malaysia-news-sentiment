const AuditLog = require('../models/AuditLog');

const auditLog = (action) => async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = async (body) => {
    const status = res.statusCode >= 400 ? 'failed' : 'success';
    try {
      await AuditLog.create({
        action,
        userId: req.userId || req.body?.email || 'anonymous',
        userEmail: req.user?.email || req.body?.email || null,
        role: req.userRole || 'unknown',
        ip: req.ip || req.headers['x-forwarded-for'] || null,
        status,
        details: status === 'failed' ? (body?.error || null) : null,
      });
    } catch (err) {
      console.error('Audit log error:', err.message);
    }
    return originalJson(body);
  };

  next();
};

module.exports = auditLog;
