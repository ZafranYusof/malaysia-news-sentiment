const Article = require('../models/Article');

/**
 * GET /api/share/:articleId
 * Returns shareable data for an article (public, no auth)
 */
const getShareData = async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await Article.findById(articleId).select('title sentiment source url urlToImage publishedAt topic confidence');
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const shareText = `${article.title} - Sentiment: ${article.sentiment} | MYNewsSentiment`;
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/${articleId}`;

    res.json({
      id: article._id,
      title: article.title,
      sentiment: article.sentiment,
      confidence: article.confidence,
      source: article.source,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      topic: article.topic,
      shareText,
      shareUrl,
    });
  } catch (err) {
    console.error('[Share] Error:', err.message);
    res.status(500).json({ error: 'Failed to get share data' });
  }
};

/**
 * GET /api/embed/:articleId
 * Returns embeddable HTML snippet with sentiment badge
 */
const getEmbedCode = async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await Article.findById(articleId).select('title sentiment source url confidence publishedAt');
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const sentimentColor = article.sentiment === 'Positive' ? '#22c55e' : article.sentiment === 'Negative' ? '#ef4444' : '#f59e0b';
    
    const embedHtml = `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;max-width:400px;font-family:system-ui,-apple-system,sans-serif;background:#fff;">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
    <span style="background:${sentimentColor};color:#fff;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;">${article.sentiment}</span>
    <span style="font-size:11px;color:#6b7280;">${article.source}</span>
  </div>
  <a href="${frontendUrl}/shared/${articleId}" target="_blank" style="color:#111;text-decoration:none;font-size:14px;font-weight:600;line-height:1.4;display:block;margin-bottom:8px;">${article.title}</a>
  <div style="display:flex;align-items:center;justify-content:space-between;">
    <span style="font-size:11px;color:#9ca3af;">Confidence: ${Math.round((article.confidence || 0) * 100)}%</span>
    <a href="${frontendUrl}" target="_blank" style="font-size:10px;color:#2563eb;text-decoration:none;">MYNewsSentiment</a>
  </div>
</div>`;

    const iframeCode = `<iframe src="${frontendUrl}/shared/${articleId}?embed=true" width="420" height="200" frameborder="0" style="border-radius:12px;border:1px solid #e5e7eb;"></iframe>`;

    res.json({
      embedHtml,
      iframeCode,
      articleId: article._id,
      title: article.title,
      sentiment: article.sentiment,
    });
  } catch (err) {
    console.error('[Embed] Error:', err.message);
    res.status(500).json({ error: 'Failed to generate embed code' });
  }
};

module.exports = { getShareData, getEmbedCode };
