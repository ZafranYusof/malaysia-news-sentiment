const Article = require('../models/Article');

const CREDIBILITY_WEIGHTS = {
  balance: 0.4,
  confidence: 0.4,
  reliability: 0.2,
};

const calculateCredibilityMetrics = (source) => {
  const { _id: name, total, positive, negative, neutral, avgConfidence, alerts } = source;

  const posRatio = positive / total;
  const negRatio = negative / total;
  const neuRatio = neutral / total;

  const expectedRatio = 1 / 3;
  const biasDeviation = Math.sqrt(
    Math.pow(posRatio - expectedRatio, 2) +
    Math.pow(negRatio - expectedRatio, 2) +
    Math.pow(neuRatio - expectedRatio, 2)
  );

  const biasDirection = posRatio > negRatio ? 'positive' : negRatio > posRatio ? 'negative' : 'balanced';
  const biasStrength = Math.abs(posRatio - negRatio);

  const sentimentValues = source.sentiments.map(s => s === 'Positive' ? 1 : s === 'Negative' ? -1 : 0);
  const mean = sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length;
  const variance = sentimentValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sentimentValues.length;

  const balanceScore = Math.max(0, 100 - biasDeviation * 200);
  const confidenceScore = (avgConfidence || 0.5) * 100;
  const alertPenalty = (alerts / total) * 30;
  const reliabilityScore = Math.max(0, 100 - alertPenalty);

  const credibilityScore = Math.round(
    Math.max(0, Math.min(100,
      balanceScore * CREDIBILITY_WEIGHTS.balance +
      confidenceScore * CREDIBILITY_WEIGHTS.confidence +
      reliabilityScore * CREDIBILITY_WEIGHTS.reliability
    ))
  );

  return {
    source: name,
    credibilityScore,
    volume: total,
    sentimentBreakdown: { positive, negative, neutral },
    biasDirection,
    biasStrength: Math.round(biasStrength * 100),
    consistencyScore: Math.round((1 - variance) * 100),
    avgConfidence: Math.round((avgConfidence || 0.5) * 100),
    alertRatio: Math.round((alerts / total) * 100),
    reliabilityScore: Math.round(reliabilityScore),
  };
};

/**
 * GET /api/sources/credibility
 * Calculate credibility scores for news sources based on sentiment patterns
 */
const getSourceCredibility = async (req, res) => {
  try {
    const userId = req.user?.id;
    const filter = {};
    if (userId) filter.userId = userId;

    // Aggregate source data
    const sourceStats = await Article.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$source',
          total: { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'Positive'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'Negative'] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $eq: ['$sentiment', 'Neutral'] }, 1, 0] } },
          avgConfidence: { $avg: '$confidence' },
          alerts: { $sum: { $cond: ['$isAlert', 1, 0] } },
          sentiments: { $push: '$sentiment' },
        },
      },
      { $match: { total: { $gte: 3 } } }, // Minimum 3 articles for meaningful stats
      { $sort: { total: -1 } },
      { $limit: 15 },
    ]);

    if (!sourceStats.length) {
      return res.json([]);
    }

    // Calculate credibility metrics for each source
    const results = sourceStats.map(calculateCredibilityMetrics);

    // Sort by credibility score descending
    results.sort((a, b) => b.credibilityScore - a.credibilityScore);

    res.json(results);
  } catch (error) {
    console.error('Source credibility error:', error);
    res.status(500).json({ error: 'Failed to calculate source credibility' });
  }
};

module.exports = {
  getSourceCredibility,
  __testables: {
    CREDIBILITY_WEIGHTS,
    calculateCredibilityMetrics,
  },
};
