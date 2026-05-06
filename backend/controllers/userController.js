const User = require('../models/User');

const DEFAULT_LAYOUT = [
  { widgetId: 'sentiment-overview', position: 0, size: 'lg', visible: true },
  { widgetId: 'recent-articles', position: 1, size: 'md', visible: true },
  { widgetId: 'trending-topics', position: 2, size: 'md', visible: true },
  { widgetId: 'category-breakdown', position: 3, size: 'md', visible: true },
  { widgetId: 'source-stats', position: 4, size: 'sm', visible: true },
  { widgetId: 'quick-search', position: 5, size: 'sm', visible: true },
  { widgetId: 'ai-insights', position: 6, size: 'md', visible: true },
  { widgetId: 'heatmap-mini', position: 7, size: 'lg', visible: true },
];

/**
 * GET /api/user/dashboard-layout
 */
const getDashboardLayout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('dashboardLayout');
    const layout = user?.dashboardLayout?.length ? user.dashboardLayout : DEFAULT_LAYOUT;
    res.json({ layout });
  } catch (err) {
    console.error('[DashboardLayout] Get error:', err.message);
    res.status(500).json({ error: 'Failed to get dashboard layout' });
  }
};

/**
 * PUT /api/user/dashboard-layout
 */
const saveDashboardLayout = async (req, res) => {
  try {
    const { layout } = req.body;
    
    if (!Array.isArray(layout)) {
      return res.status(400).json({ error: 'Layout must be an array' });
    }

    // Validate layout items
    const validSizes = ['sm', 'md', 'lg'];
    const sanitized = layout.map((item, idx) => ({
      widgetId: String(item.widgetId || ''),
      position: typeof item.position === 'number' ? item.position : idx,
      size: validSizes.includes(item.size) ? item.size : 'md',
      visible: typeof item.visible === 'boolean' ? item.visible : true,
    }));

    await User.findByIdAndUpdate(req.user._id, { dashboardLayout: sanitized });
    res.json({ layout: sanitized, message: 'Dashboard layout saved' });
  } catch (err) {
    console.error('[DashboardLayout] Save error:', err.message);
    res.status(500).json({ error: 'Failed to save dashboard layout' });
  }
};

module.exports = { getDashboardLayout, saveDashboardLayout, DEFAULT_LAYOUT };
