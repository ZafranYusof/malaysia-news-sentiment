const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'telegram'],
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  conditions: {
    sentiment: {
      type: String,
      enum: ['Negative', 'Positive', 'Neutral', 'any'],
      default: 'any',
    },
    threshold: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.7,
    },
    topics: [String],
    sources: [String],
  },
  telegramChatId: {
    type: String,
    default: null,
  },
}, { timestamps: true });

alertSchema.index({ user: 1, enabled: 1 });

module.exports = mongoose.model('Alert', alertSchema);
