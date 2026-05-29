const AuditLog = require('../models/AuditLog');

const getLogs = async (req, res) => {
  try {
    const { action, status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (status) filter.status = status;

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({ logs, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
};

module.exports = { getLogs };
