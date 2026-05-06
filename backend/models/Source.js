const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    default: '',
  },
  credibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  bias: {
    type: String,
    enum: ['left', 'center', 'right', 'unknown'],
    default: 'unknown',
  },
  totalArticles: {
    type: Number,
    default: 0,
  },
  avgSentimentAccuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  lastChecked: {
    type: Date,
    default: null,
  },
  factCheckScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  transparencyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
}, { timestamps: true });

module.exports = mongoose.model('Source', sourceSchema);
