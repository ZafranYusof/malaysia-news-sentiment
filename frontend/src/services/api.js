import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  withCredentials: true, // Required for secure cookie-based auth
});

// Add request interceptor to attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Fetch and analyze news for a given search query
 */
export const fetchAndAnalyzeNews = async (query, pageSize = 12, latest = false) => {
  const response = await api.get('/news', {
    params: { q: query, pageSize, latest },
  });
  return response.data;
};

/**
 * Get all previously analyzed articles with full filtering and pagination
 * (#6 Pagination, #7 Search/Date Filter)
 */
export const getHistory = async (params = {}) => {
  const response = await api.get('/history', { params });
  return response.data;
};

/**
 * Get aggregate statistics (#16)
 */
export const getStats = async (params = {}) => {
  const response = await api.get('/history/stats', { params });
  return response.data;
};

/**
 * Get sentiment trend data over time
 */
export const getTrends = async (params = {}) => {
  const response = await api.get('/history/trends', { params });
  return response.data;
};

/**
 * Get top news sources with sentiment breakdown
 */
export const getTopSources = async (topic = '') => {
  const response = await api.get('/news/sources', { params: topic ? { topic } : {} });
  return response.data;
};

/**
 * Get keyword frequency for Word Cloud (#11)
 */
export const getKeywords = async (params = {}) => {
  const response = await api.get('/news/keywords', { params });
  return response.data;
};

/**
 * Generate an AI digest summary for a batch of articles
 */
export const generateDigest = async (articles, topic) => {
  const response = await api.post('/news/digest', { articles, topic });
  return response.data;
};

/**
 * Generate a 7-day AI forecast based on analyzed articles
 */
export const generateForecast = async (articles, topic) => {
  const response = await api.post('/news/forecast', { articles, topic });
  return response.data;
};

/**
 * Delete an article by ID
 */
export const deleteArticle = async (id) => {
  const response = await api.delete(`/history/${id}`);
  return response.data;
};

/**
 * Get sentiment breakdown by region (Malaysian States)
 * (#1 Heatmap)
 */
export const getRegionalData = async (topic = '') => {
  const response = await api.get('/news/regional', { params: topic ? { topic } : {} });
  return response.data;
};

/**
 * Increment article view count and track history (#1)
 */
export const trackView = async (id) => {
  const response = await api.post(`/news/${id}/view`);
  return response.data;
};

/**
 * Submit user sentiment feedback (#2 Hybrid)
 * @param {string} sentiment - Positive, Negative, Neutral
 * @param {string} type - up, down (optional)
 */
export const voteSentiment = async (id, feedback) => {
  const response = await api.post(`/news/${id}/vote`, feedback);
  return response.data;
};

/**
 * Get top viewed news with filters (#1)
 */
export const getTopViewed = async (params = {}) => {
  const response = await api.get('/news/top', { params });
  return response.data;
};

/**
 * Toggle article bookmark status (#3)
 */
export const toggleBookmark = async (id) => {
  const response = await api.post(`/news/${id}/bookmark`);
  return response.data;
};

/**
 * Get admin system overview stats (#4)
 */
export const getAdminStats = async () => {
  const response = await api.get('/news/admin/stats');
  return response.data;
};

/**
 * Get strategic AI insights (Risks/Opportunities) (#Meltwater Style)
 */
export const getAdminInsights = async () => {
  const response = await api.get('/news/admin/insights');
  return response.data;
};

export default api;
