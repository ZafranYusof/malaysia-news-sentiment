const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
// [UPDATED] Imported auditLog middleware to record admin actions
const auditLog = require('../middleware/auditLog');
const { sendTestEmail, isRealSmtp } = require('../services/emailService');
const { getSourcesHealth, probeAllSources } = require('../services/rssService');

/**
 * GET /api/v1/admin/test-email
 * Send a test email to verify SMTP configuration.
 * Admin only.
 * Query params:
 *   - to (optional): recipient email. Defaults to EMAIL_USER.
 */
// [UPDATED] Added auditLog middleware to track admin test-email action
router.get('/test-email', protect, authorize('admin'), auditLog('admin_test_email'), async (req, res) => {
  try {
    const to = req.query.to || process.env.EMAIL_USER;

    if (!to) {
      return res.status(400).json({
        error: 'No recipient. Set EMAIL_USER env var or pass ?to=email@example.com',
      });
    }

    const info = await sendTestEmail(to);

    res.json({
      success: true,
      message: `Test email sent to ${to}`,
      mode: isRealSmtp() ? 'production' : 'ethereal',
      messageId: info.messageId,
      ...(info.accepted && { accepted: info.accepted }),
    });
  } catch (err) {
    console.error('[Admin] Test email failed:', err.message);
    res.status(500).json({
      error: 'Failed to send test email',
      details: err.message,
      mode: isRealSmtp() ? 'production' : 'ethereal',
    });
  }
});

/**
 * GET /api/v1/admin/email-status
 * Check current email configuration status.
 * Admin only.
 */
router.get('/email-status', protect, authorize('admin'), (req, res) => {
  const realSmtp = isRealSmtp();

  res.json({
    configured: realSmtp,
    mode: realSmtp ? 'production' : 'ethereal',
    host: realSmtp ? (process.env.EMAIL_HOST || 'smtp.gmail.com') : 'smtp.ethereal.email',
    port: realSmtp ? parseInt(process.env.EMAIL_PORT || '587') : 587,
    user: realSmtp ? process.env.EMAIL_USER.replace(/(.{3}).*(@.*)/, '$1***$2') : null,
    note: realSmtp
      ? 'SMTP credentials configured. Emails will be delivered.'
      : 'No SMTP credentials. Using Ethereal test account (emails not delivered).',
  });
});

/**
 * GET /api/v1/admin/source-health
 * Last-known health of every enabled news vendor feed (adaptive-maintenance
 * monitor). Reflects runtime results recorded since the last server start.
 * Admin only.
 *
 * Query params:
 *   - probe=true : actively re-fetch all feeds now before returning (slower).
 */
router.get('/source-health', protect, authorize('admin'), async (req, res) => {
  try {
    const result = req.query.probe === 'true'
      ? await probeAllSources()
      : getSourcesHealth();

    // 200 always — this endpoint reports health, it isn't itself unhealthy.
    res.json({
      success: true,
      checkedLive: req.query.probe === 'true',
      ...result,
    });
  } catch (err) {
    console.error('[Admin] source-health failed:', err.message);
    res.status(500).json({ error: 'Failed to read source health', details: err.message });
  }
});

module.exports = router;
