const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { sendTestEmail, isRealSmtp } = require('../services/emailService');

/**
 * GET /api/v1/admin/test-email
 * Send a test email to verify SMTP configuration.
 * Admin only.
 * Query params:
 *   - to (optional): recipient email. Defaults to EMAIL_USER.
 */
router.get('/test-email', protect, authorize('admin'), async (req, res) => {
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

module.exports = router;
