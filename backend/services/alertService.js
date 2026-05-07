const Alert = require('../models/Alert');

/**
 * Check all enabled alerts against a newly analyzed article.
 * Called after each article is processed.
 */
const checkAlerts = async (article) => {
  try {
    const alerts = await Alert.find({ enabled: true }).populate('user', 'name email');

    for (const alert of alerts) {
      if (!matchesConditions(alert, article)) continue;

      if (alert.type === 'email' && alert.user?.email) {
        await sendEmailAlert(alert.user, article, alert);
      } else if (alert.type === 'telegram' && alert.telegramChatId) {
        await sendTelegramAlert(alert.telegramChatId, article);
      }
    }
  } catch (err) {
    console.error('Alert check error:', err.message);
  }
};

/**
 * Check if an article matches alert conditions
 */
const matchesConditions = (alert, article) => {
  const { sentiment, threshold, topics, sources } = alert.conditions;

  // Sentiment filter (normalize case for comparison)
  if (sentiment !== 'any') {
    if (article.sentiment?.toLowerCase() !== sentiment.toLowerCase()) return false;
  }

  // Confidence threshold
  if (article.confidence && article.confidence < threshold) return false;

  // Topics filter (schema uses 'topic' singular string, not 'topics' array)
  if (topics && topics.length > 0) {
    const articleTopic = (article.topic || '').toLowerCase();
    const titleLower = (article.title || '').toLowerCase();
    const hasMatch = topics.some(t => 
      articleTopic.includes(t.toLowerCase()) || titleLower.includes(t.toLowerCase())
    );
    if (!hasMatch) return false;
  }

  // Sources filter
  if (sources && sources.length > 0) {
    const articleSource = (article.source || '').toLowerCase();
    const hasMatch = sources.some(s => articleSource.includes(s.toLowerCase()));
    if (!hasMatch) return false;
  }

  return true;
};

/**
 * Send email notification for an alert
 */
const sendEmailAlert = async (user, article, alert) => {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const sentimentEmoji = article.sentiment === 'Positive' ? '🟢' : article.sentiment === 'Negative' ? '🔴' : '🟡';

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: `${sentimentEmoji} News Alert: ${article.title?.slice(0, 60)}...`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">MY News Sentiment Alert</h2>
          <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px;">${article.title}</h3>
            <p style="color: #666; margin: 4px 0;">Source: ${article.source || 'Unknown'}</p>
            <p style="margin: 4px 0;">Sentiment: <strong>${sentimentEmoji} ${article.sentiment}</strong> (${Math.round((article.confidence || 0) * 100)}% confidence)</p>
            ${article.url ? `<a href="${article.url}" style="color: #2563eb;">Read Article →</a>` : ''}
          </div>
          <p style="color: #999; font-size: 12px;">You received this because of your alert settings. Manage alerts in your dashboard.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Email alert failed:', err.message);
  }
};

/**
 * Send Telegram notification for an alert
 */
const sendTelegramAlert = async (chatId, article) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN not set, skipping telegram alert');
      return;
    }

    const sentimentEmoji = article.sentiment === 'Positive' ? '🟢' : article.sentiment === 'Negative' ? '🔴' : '🟡';
    const text = `${sentimentEmoji} *News Alert*\n\n*${article.title}*\nSource: ${article.source || 'Unknown'}\nSentiment: ${article.sentiment} (${Math.round((article.confidence || 0) * 100)}%)\n${article.url ? `\n[Read Article](${article.url})` : ''}`;

    const fetch = require('node-fetch');
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    });
  } catch (err) {
    console.error('Telegram alert failed:', err.message);
  }
};

module.exports = { checkAlerts, sendEmailAlert, sendTelegramAlert };
