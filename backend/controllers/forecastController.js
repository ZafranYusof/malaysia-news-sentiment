const Article = require('../models/Article');
const { performAiRequest } = require('../services/openaiService');

/**
 * Simple linear regression helper
 */
const linearRegression = (points) => {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0 };
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += points[i];
    sumXY += i * points[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope: isNaN(slope) ? 0 : slope, intercept: isNaN(intercept) ? 0 : intercept };
};

/**
 * Calculate sentiment score: Positive=1, Neutral=0, Negative=-1
 */
const sentimentToScore = (sentiment) => {
  if (sentiment === 'Positive') return 1;
  if (sentiment === 'Negative') return -1;
  return 0;
};

/**
 * GET /api/forecast/:topic?days=7
 * Returns historical sentiment + predicted future sentiment
 */
const getForecast = async (req, res) => {
  try {
    const { topic } = req.params;
    const days = Math.min(parseInt(req.query.days) || 7, 30);
    const historyDays = 60; // Look back 60 days

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - historyDays);

    // Get articles matching topic
    const articles = await Article.find({
      $or: [
        { topic: { $regex: topic, $options: 'i' } },
        { title: { $regex: topic, $options: 'i' } },
        { description: { $regex: topic, $options: 'i' } },
        { categories: { $regex: topic, $options: 'i' } },
      ],
      publishedAt: { $gte: startDate },
    }).select('sentiment confidence publishedAt createdAt').sort({ publishedAt: 1 });

    if (articles.length < 3) {
      return res.status(200).json({
        historical: [],
        predicted: [],
        aiInsight: `Not enough data for topic "${topic}". Need at least 3 articles in the last ${historyDays} days.`,
        trend: 'Insufficient Data',
        totalArticles: articles.length,
      });
    }

    // Group by date and calculate daily average sentiment score
    const dailyMap = {};
    articles.forEach(article => {
      const articleDate = article.publishedAt || article.createdAt;
      if (!articleDate) return;
      const dateKey = articleDate.toISOString().split('T')[0];
      if (!dailyMap[dateKey]) dailyMap[dateKey] = { scores: [], count: 0 };
      dailyMap[dateKey].scores.push(sentimentToScore(article.sentiment));
      dailyMap[dateKey].count++;
    });

    // Fill gaps with interpolation and build historical array
    const historical = [];
    const sortedDates = Object.keys(dailyMap).sort();
    
    sortedDates.forEach(date => {
      const avg = dailyMap[date].scores.reduce((a, b) => a + b, 0) / dailyMap[date].scores.length;
      historical.push({
        date,
        sentiment: parseFloat(avg.toFixed(3)),
        articleCount: dailyMap[date].count,
      });
    });

    // Calculate 7-day moving average for smoothing
    const smoothed = [];
    for (let i = 0; i < historical.length; i++) {
      const window = historical.slice(Math.max(0, i - 6), i + 1);
      const avg = window.reduce((sum, d) => sum + d.sentiment, 0) / window.length;
      smoothed.push(avg);
    }

    // Linear regression on smoothed data for prediction
    const { slope, intercept } = linearRegression(smoothed);

    // Generate predictions
    const predicted = [];
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    
    for (let i = 1; i <= days; i++) {
      const predDate = new Date(lastDate);
      predDate.setDate(predDate.getDate() + i);
      
      const predictedValue = slope * (smoothed.length - 1 + i) + intercept;
      // Clamp between -1 and 1
      const clamped = Math.max(-1, Math.min(1, predictedValue));
      // Confidence decreases as we predict further out
      const confidence = Math.max(0.2, 1 - (i * 0.1));
      
      predicted.push({
        date: predDate.toISOString().split('T')[0],
        predictedSentiment: parseFloat(clamped.toFixed(3)),
        confidence: parseFloat(confidence.toFixed(2)),
      });
    }

    // Determine trend
    let trend = 'Stable';
    if (slope > 0.02) trend = 'Improving';
    else if (slope < -0.02) trend = 'Declining';

    // Generate AI insight
    let aiInsight = '';
    try {
      // Only if AI is available
      if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_')) {
        const avgSentiment = smoothed[smoothed.length - 1];
        const prompt = `You are a Malaysian news analyst. Based on sentiment data for the topic "${topic}":
- Current average sentiment score: ${avgSentiment.toFixed(2)} (scale: -1 negative to +1 positive)
- Trend direction: ${trend} (slope: ${slope.toFixed(4)})
- Total articles analyzed: ${articles.length} over ${historyDays} days
- Predicted sentiment for next ${days} days: ${predicted[0]?.predictedSentiment} to ${predicted[predicted.length-1]?.predictedSentiment}

Write a brief 2-3 sentence qualitative forecast about what this means for public sentiment on "${topic}" in Malaysia. Be specific and actionable. Do not use JSON format, just plain text.`;

        const raw = await performAiRequest(prompt, process.env.QWEN_MODEL || 'gpt-4o-mini', 0.4, 200);
        aiInsight = raw?.trim() || '';
      }
    } catch (err) {
      console.warn('[Forecast] AI insight generation failed:', err.message);
    }

    if (!aiInsight) {
      // Fallback insight
      const avgScore = smoothed[smoothed.length - 1];
      const sentimentLabel = avgScore > 0.2 ? 'positive' : avgScore < -0.2 ? 'negative' : 'neutral';
      aiInsight = `Based on ${articles.length} articles over the past ${historyDays} days, public sentiment for "${topic}" is currently ${sentimentLabel} with a ${trend.toLowerCase()} trend. ${trend === 'Improving' ? 'Coverage is becoming more favorable.' : trend === 'Declining' ? 'Negative coverage is increasing.' : 'Sentiment remains relatively stable.'}`;
    }

    res.json({
      historical,
      predicted,
      aiInsight,
      trend,
      totalArticles: articles.length,
      daysAnalyzed: historyDays,
    });
  } catch (err) {
    console.error('[Forecast] Error:', err.message);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
};

module.exports = { getForecast };
