const Article = require('../models/Article');

/**
 * GET /api/v1/news/advanced-search
 * Advanced search with filters, facets, and pagination
 */
const advancedSearch = async (req, res) => {
  try {
    const {
      q = '',
      sentiment,
      source,
      dateFrom,
      dateTo,
      language,
      minConfidence,
      sortBy = 'date',
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build query filter
    const filter = {};

    // Full-text search on title + description + content
    if (q.trim()) {
      const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { content: regex },
      ];
    }

    // Sentiment filter (comma-separated)
    if (sentiment) {
      const sentiments = sentiment.split(',').map(s => s.trim()).filter(Boolean);
      if (sentiments.length) filter.sentiment = { $in: sentiments };
    }

    // Source filter (comma-separated)
    if (source) {
      const sources = source.split(',').map(s => s.trim()).filter(Boolean);
      if (sources.length) {
        filter.source = { $in: sources.map(s => new RegExp(s, 'i')) };
      }
    }

    // Date range
    if (dateFrom || dateTo) {
      filter.publishedAt = {};
      if (dateFrom) filter.publishedAt.$gte = new Date(dateFrom);
      if (dateTo) filter.publishedAt.$lte = new Date(dateTo);
    }

    // Language filter
    if (language) {
      filter.language = language.toLowerCase();
    }

    // Minimum confidence
    if (minConfidence) {
      filter.confidence = { $gte: parseFloat(minConfidence) };
    }

    // Sort options
    let sort = {};
    switch (sortBy) {
      case 'relevance':
        sort = { viewCount: -1, publishedAt: -1 };
        break;
      case 'sentiment':
        sort = { confidence: -1, publishedAt: -1 };
        break;
      case 'date':
      default:
        sort = { publishedAt: -1 };
    }

    // Execute query with pagination
    const [articles, total] = await Promise.all([
      Article.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Article.countDocuments(filter),
    ]);

    // Generate facets (counts for filters)
    const facetPipeline = [
      { $match: filter.$or ? { $or: filter.$or } : {} },
      {
        $facet: {
          sentimentCounts: [
            { $group: { _id: '$sentiment', count: { $sum: 1 } } },
          ],
          sourceCounts: [
            { $group: { _id: '$source', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
          ],
          languageCounts: [
            { $group: { _id: '$language', count: { $sum: 1 } } },
          ],
        },
      },
    ];

    const [facetResult] = await Article.aggregate(facetPipeline);

    const facets = {
      sentimentCounts: (facetResult?.sentimentCounts || []).reduce((acc, item) => {
        acc[item._id || 'Unknown'] = item.count;
        return acc;
      }, {}),
      sourceCounts: (facetResult?.sourceCounts || []).reduce((acc, item) => {
        acc[item._id || 'Unknown'] = item.count;
        return acc;
      }, {}),
      languageCounts: (facetResult?.languageCounts || []).reduce((acc, item) => {
        acc[item._id || 'unknown'] = item.count;
        return acc;
      }, {}),
    };

    res.json({
      articles,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      facets,
    });
  } catch (err) {
    console.error('Advanced search error:', err.message);
    res.status(500).json({ error: 'Search failed.' });
  }
};

module.exports = { advancedSearch };
