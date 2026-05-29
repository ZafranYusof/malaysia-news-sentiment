const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  userId: { type: String, default: 'anonymous' },
  userEmail: { type: String, default: null },
  role: { type: String, default: 'unknown' },
  ip: { type: String, default: null },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  details: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
