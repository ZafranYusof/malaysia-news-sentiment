const nodemailer = require('nodemailer');

const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ── Transporter Cache ─────────────────────────────────────────
// Reuse transporter across calls to avoid creating new connections each time.
let _cachedTransporter = null;
let _cachedMode = null; // 'smtp' or 'ethereal'

/**
 * Creates a reusable transporter.
 * Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in .env
 * For Gmail: EMAIL_HOST=smtp.gmail.com, EMAIL_PORT=587
 * For testing: leave blank to use console fallback
 */
const getTransporter = async () => {
  const hasRealCreds = process.env.EMAIL_USER && process.env.EMAIL_PASS
    && !process.env.EMAIL_USER.includes('your_');

  const mode = hasRealCreds ? 'smtp' : 'ethereal';

  // Return cached if same mode
  if (_cachedTransporter && _cachedMode === mode) return _cachedTransporter;

  if (hasRealCreds) {
    _cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: parseInt(process.env.EMAIL_PORT || '587') === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    _cachedMode = 'smtp';
    console.log(`📧 Email transporter: SMTP via ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
  } else {
    // Fallback: Ethereal test account (logs preview URL)
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Using Ethereal test email (no real SMTP configured)');
    console.log(`   Preview at: https://ethereal.email`);

    _cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    _cachedMode = 'ethereal';
  }

  return _cachedTransporter;
};

/**
 * Check if real SMTP is configured (not Ethereal fallback)
 */
const isRealSmtp = () => {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS
    && !process.env.EMAIL_USER.includes('your_'));
};

/**
 * Get the "from" address for outgoing emails
 */
const getFromAddress = () => {
  return `"MY News Sentiment" <${process.env.EMAIL_USER || 'noreply@mynews.my'}>`;
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Shared HTML Email Template ────────────────────────────────
const emailTemplate = (title, body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .head { background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 28px 32px; }
    .head h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
    .head p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 32px; color: #374151; font-size: 14px; line-height: 1.7; }
    .btn { display: inline-block; margin: 24px 0; padding: 13px 28px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff !important; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; }
    .footer { padding: 20px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <h1>MY News Sentiment</h1>
      <p>Malaysian News Intelligence Platform</p>
    </div>
    <div class="body">
      <h2 style="margin-top:0;color:#0f172a;">${title}</h2>
      ${body}
    </div>
    <div class="footer">
      This is an automated email. Please do not reply. &middot; FYP Project &copy; 2026 UMPSA
    </div>
  </div>
</body>
</html>
`;

// ── Alert Email Template ──────────────────────────────────────
const alertEmailTemplate = (article, alert) => {
  const sentimentEmoji = article.sentiment === 'Positive' ? '🟢' : article.sentiment === 'Negative' ? '🔴' : '🟡';
  const confidence = Math.round((article.confidence || 0) * 100);

  return emailTemplate(`${sentimentEmoji} News Alert`, `
    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 16px 0; border: 1px solid #e2e8f0;">
      <h3 style="margin: 0 0 8px; color: #0f172a;">${escapeHtml(article.title)}</h3>
      <p style="color: #64748b; margin: 4px 0; font-size: 13px;">Source: ${escapeHtml(article.source || 'Unknown')}</p>
      <p style="margin: 8px 0;">Sentiment: <strong>${sentimentEmoji} ${escapeHtml(article.sentiment)}</strong> (${confidence}% confidence)</p>
      ${article.url ? `<a class="btn" href="${article.url}" style="margin-top: 12px;">Read Article →</a>` : ''}
    </div>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
      You received this because of your alert settings.
      <a href="${FRONTEND_URL}/settings" style="color: #3b82f6;">Manage alerts</a>
    </p>
  `);
};

// ── Send Email (core function) ────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    html,
  });

  // Log preview URL for Ethereal (dev/test)
  if (!isRealSmtp()) {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`📧 Email preview: ${preview}`);
  }

  return info;
};

// ── Send Verification Email ───────────────────────────────────
const sendVerificationEmail = async (user, token) => {
  const link = `${FRONTEND_URL}/verify-email?token=${token}`;

  return sendEmail({
    to: user.email,
    subject: 'Verify your email — MY News Sentiment',
    html: emailTemplate('Verify Your Email', `
      <p>Hi <strong>${escapeHtml(user.name)}</strong>,</p>
      <p>Thank you for registering! Click the button below to verify your email address:</p>
      <a class="btn" href="${link}">Verify Email</a>
      <p style="color:#9ca3af;font-size:12px;">Link expires in 24 hours. If you didn't register, ignore this email.</p>
    `),
  });
};

// ── Send Password Reset Email ─────────────────────────────────
const sendResetEmail = async (user, token) => {
  const link = `${FRONTEND_URL}/reset-password?token=${token}`;

  return sendEmail({
    to: user.email,
    subject: 'Reset your password — MY News Sentiment',
    html: emailTemplate('Reset Your Password', `
      <p>Hi <strong>${escapeHtml(user.name)}</strong>,</p>
      <p>We received a request to reset your password. Click below to set a new password:</p>
      <a class="btn" href="${link}">Reset Password</a>
      <p style="color:#9ca3af;font-size:12px;">Link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `),
  });
};

// ── Send Alert Email ──────────────────────────────────────────
const sendAlertEmail = async (user, article, alert) => {
  const sentimentEmoji = article.sentiment === 'Positive' ? '🟢' : article.sentiment === 'Negative' ? '🔴' : '🟡';

  return sendEmail({
    to: user.email,
    subject: `${sentimentEmoji} News Alert: ${(article.title || '').slice(0, 60)}...`,
    html: alertEmailTemplate(article, alert),
  });
};

// ── Send Test Email ───────────────────────────────────────────
const sendTestEmail = async (toEmail) => {
  const now = new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' });

  return sendEmail({
    to: toEmail,
    subject: '✅ Test Email — MY News Sentiment',
    html: emailTemplate('Email Configuration Test', `
      <p>If you're reading this, your email setup is working correctly! 🎉</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; color: #166534;"><strong>✅ SMTP Connection:</strong> Successful</p>
        <p style="margin: 8px 0 0; color: #166534;"><strong>📧 Provider:</strong> ${process.env.EMAIL_HOST || 'smtp.gmail.com'}</p>
        <p style="margin: 8px 0 0; color: #166534;"><strong>🕐 Sent at:</strong> ${now}</p>
        <p style="margin: 8px 0 0; color: #166534;"><strong>📤 From:</strong> ${process.env.EMAIL_USER || 'Ethereal (test)'}</p>
        <p style="margin: 8px 0 0; color: #166534;"><strong>🔧 Mode:</strong> ${isRealSmtp() ? 'Production SMTP' : 'Ethereal Test'}</p>
      </div>
      <p style="color: #6b7280; font-size: 13px;">
        Newsletter digests, alerts, and verification emails will use this same configuration.
      </p>
    `),
  });
};

module.exports = {
  getTransporter,
  getFromAddress,
  isRealSmtp,
  emailTemplate,
  alertEmailTemplate,
  escapeHtml,
  sendEmail,
  sendVerificationEmail,
  sendResetEmail,
  sendAlertEmail,
  sendTestEmail,
  FRONTEND_URL,
};
