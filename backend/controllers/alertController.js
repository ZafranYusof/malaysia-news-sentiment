const Alert = require('../models/Alert');
const { sendEmailAlert, sendTelegramAlert } = require('../services/alertService');

// GET /api/alerts — list user's alerts
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/alerts — create alert
exports.createAlert = async (req, res) => {
  try {
    const { type, enabled, conditions, telegramChatId } = req.body;

    if (!type || !['email', 'telegram'].includes(type)) {
      return res.status(400).json({ error: 'Invalid alert type. Must be email or telegram.' });
    }

    if (type === 'telegram' && !telegramChatId) {
      return res.status(400).json({ error: 'Telegram chat ID is required for telegram alerts.' });
    }

    const alert = await Alert.create({
      user: req.userId,
      type,
      enabled: enabled !== false,
      conditions: {
        sentiment: conditions?.sentiment || 'any',
        threshold: conditions?.threshold || 0.7,
        topics: conditions?.topics || [],
        sources: conditions?.sources || [],
      },
      telegramChatId: type === 'telegram' ? telegramChatId : null,
    });

    res.status(201).json({ alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/alerts/:id — update alert
exports.updateAlert = async (req, res) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, user: req.userId });
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });

    const { type, enabled, conditions, telegramChatId } = req.body;

    if (type) alert.type = type;
    if (typeof enabled === 'boolean') alert.enabled = enabled;
    if (conditions) {
      if (conditions.sentiment) alert.conditions.sentiment = conditions.sentiment;
      if (conditions.threshold !== undefined) alert.conditions.threshold = conditions.threshold;
      if (conditions.topics) alert.conditions.topics = conditions.topics;
      if (conditions.sources) alert.conditions.sources = conditions.sources;
    }
    if (telegramChatId !== undefined) alert.telegramChatId = telegramChatId;

    await alert.save();
    res.json({ alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/alerts/:id — delete alert
exports.deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });
    res.json({ message: 'Alert deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/alerts/test — send test notification
exports.testAlert = async (req, res) => {
  try {
    const { alertId } = req.body;
    const alert = await Alert.findOne({ _id: alertId, user: req.userId }).populate('user', 'name email');
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });

    const testArticle = {
      title: 'Test Alert: Malaysia Economy Shows Growth',
      source: 'Test Source',
      sentiment: 'positive',
      confidence: 0.92,
      url: 'https://example.com/test-article',
    };

    if (alert.type === 'email' && alert.user?.email) {
      await sendEmailAlert(alert.user, testArticle, alert);
    } else if (alert.type === 'telegram' && alert.telegramChatId) {
      await sendTelegramAlert(alert.telegramChatId, testArticle);
    } else {
      return res.status(400).json({ error: 'Alert configuration incomplete.' });
    }

    res.json({ message: 'Test notification sent!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
