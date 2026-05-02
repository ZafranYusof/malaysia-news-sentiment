const Article = require('../models/Article');

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
    const results = sourceStats.map((source) => {
      const { _id: name, total, positive, negative, neutral, avgConfidence, alerts } = source;

      // Bias calculation: how skewed is the sentiment distribution?
      const posRatio = positive / total;
      const negRatio = negative / total;
      const neuRatio = neutral / total;

      // Ideal distribution would be balanced - calculate deviation
      const expectedRatio = 1 / 3;
      const biasDeviation = Math.sqrt(
        Math.pow(posRatio - expectedRatio, 2) +
        Math.pow(negRatio - expectedRatio, 2) +
        Math.pow(neuRatio - expectedRatio, 2)
      );

      // Bias direction: positive bias (+), negative bias (-), or balanced (0)
      const biasDirection = posRatio > negRatio ? 'positive' : negRatio > posRatio ? 'negative' : 'balanced';
      const biasStrength = Math.abs(posRatio - negRatio);

      // Sentiment variance (how consistent are they?)
      const sentimentValues = source.sentiments.map(s => s === 'Positive' ? 1 : s === 'Negative' ? -1 : 0);
      const mean = sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length;
      const variance = sentimentValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sentimentValues.length;

      // Credibility score (0-100)
      // Higher = more credible (balanced reporting, high confidence, low alert ratio)
      const balanceScore = Math.max(0, 100 - biasDeviation * 200); // 0-100
      const confidenceScore = (avgConfidence || 0.5) * 100; // 0-100
      const alertPenalty = (alerts / total) * 30; // Penalty for high alert ratio
      const volumeBonus = Math.min(10, total / 5); // Small bonus for volume

      const credibilityScore = Math.round(
        Math.max(0, Math.min(100,
          balanceScore * 0.4 +
          confidenceScore * 0.3 +
          (100 - alertPenalty) * 0.2 +
          volumeBonus * 0.1
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
      };
    });

    // Sort by credibility score descending
    results.sort((a, b) => b.credibilityScore - a.credibilityScore);

    res.json(results);
  } catch (error) {
    console.error('Source credibility error:', error);
    res.status(500).json({ error: 'Failed to calculate source credibility' });
  }
};

module.exports = { getSourceCredibility };
