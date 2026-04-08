const nodemailer = require('nodemailer');

/**
 * Creates a reusable transporter.
 * Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in .env
 * For Gmail: EMAIL_HOST=smtp.gmail.com, EMAIL_PORT=587
 * For testing: leave blank to use Ethereal (fake SMTP)
 */
const getTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback: Ethereal test account (logs to console)
  const testAccount = await nodemailer.createTestAccount();
  console.log('📧 Using Ethereal test email. Preview at: https://ethereal.email');
  console.log(`   User: ${testAccount.user} | Pass: ${testAccount.pass}`);

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const emailTemplate = (title, body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .head { background: #3b82f6; padding: 28px 32px; }
    .head h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
    .head p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 32px; color: #374151; font-size: 14px; line-height: 1.7; }
    .btn { display: inline-block; margin: 24px 0; padding: 13px 28px; background: #3b82f6; color: #fff !important; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; }
    .footer { padding: 20px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
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
      This is an automated email. Please do not reply. · FYP Project © 2026
    </div>
  </div>
</body>
</html>
`;

// Send email verification link
const sendVerificationEmail = async (user, token) => {
  const link = `${FRONTEND_URL}/verify-email?token=${token}`;
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: `"MY News Sentiment" <${process.env.EMAIL_USER || 'noreply@mynews.my'}>`,
    to: user.email,
    subject: 'Verify your email — MY News Sentiment',
    html: emailTemplate('Verify Your Email', `
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Thank you for registering! Click the button below to verify your email address:</p>
      <a class="btn" href="${link}">Verify Email</a>
      <p style="color:#9ca3af;font-size:12px;">Link expires in 24 hours. If you didn't register, ignore this email.</p>
    `),
  });

  if (process.env.NODE_ENV !== 'production') {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`📧 Verification email preview: ${preview}`);
  }
};

// Send password reset link
const sendResetEmail = async (user, token) => {
  const link = `${FRONTEND_URL}/reset-password?token=${token}`;
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: `"MY News Sentiment" <${process.env.EMAIL_USER || 'noreply@mynews.my'}>`,
    to: user.email,
    subject: 'Reset your password — MY News Sentiment',
    html: emailTemplate('Reset Your Password', `
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>We received a request to reset your password. Click below to set a new password:</p>
      <a class="btn" href="${link}">Reset Password</a>
      <p style="color:#9ca3af;font-size:12px;">Link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `),
  });

  if (process.env.NODE_ENV !== 'production') {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`📧 Password reset email preview: ${preview}`);
  }
};

module.exports = { sendVerificationEmail, sendResetEmail };
