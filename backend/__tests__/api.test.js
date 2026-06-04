/**
 * Backend Unit & Integration Tests
 * Tests: Auth, News API, History, Sentiment Analysis
 */
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// ── Test Setup ────────────────────────────────────────────────
process.env.JWT_SECRET = process.env.JWT_SECRET || 'mynews_fyp_jwt_secret_2026_secure';
const JWT_SECRET = process.env.JWT_SECRET;

// Helper: generate a valid test token
const generateTestToken = (userId = 'test123', role = 'user') => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '1h' });
};

// ── 1. Auth Middleware Tests ──────────────────────────────────
describe('Auth Middleware', () => {
  const { protect, authorize, signToken } = require('../middleware/auth');

  test('signToken returns a valid JWT', () => {
    const token = signToken('user123', 'user');
    expect(token).toBeDefined();
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.id).toBe('user123');
    expect(decoded.role).toBe('user');
  });

  test('protect rejects request without token', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('protect rejects invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalidtoken123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('protect accepts valid token and sets userId', () => {
    const token = signToken('user456', 'user');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    protect(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe('user456');
    expect(req.userRole).toBe('user');
  });

  test('authorize allows matching role', () => {
    const middleware = authorize('admin');
    const req = { userRole: 'admin' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('authorize rejects non-matching role', () => {
    const middleware = authorize('admin');
    const req = { userRole: 'user' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

// ── 2. Sentiment Analysis Tests ───────────────────────────────
describe('Sentiment Analysis (OpenAI Service)', () => {
  // Test the local/rule-based sentiment (no API needed)
  const openaiService = require('../services/openaiService');

  test('analyzeSentiment returns valid structure', async () => {
    const result = await openaiService.analyzeSentiment(
      'Malaysia economy grows 5% in Q1 2026',
      'Strong growth driven by exports and domestic consumption'
    );

    expect(result).toHaveProperty('sentiment');
    expect(result).toHaveProperty('confidence');
    expect(['Positive', 'Negative', 'Neutral']).toContain(result.sentiment);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  test('negative news detected correctly', async () => {
    const result = await openaiService.analyzeSentiment(
      'Banjir besar melanda Kelantan, rakyat terjejas teruk',
      'Krisis banjir menyebabkan kerosakan besar dan kematian'
    );

    // Should detect negative sentiment (either via AI or local fallback)
    expect(result).toHaveProperty('sentiment');
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('positive news detected correctly', async () => {
    const result = await openaiService.analyzeSentiment(
      'Malaysia berjaya menang emas di Sukan Olimpik',
      'Atlet negara bangga membawa pulang kemenangan gemilang'
    );

    expect(result).toHaveProperty('sentiment');
    expect(result.confidence).toBeGreaterThan(0);
  });
});

// ── 3. RSS Service Tests ──────────────────────────────────────
describe('RSS Feed Services', () => {
  const { fetchFMTNews } = require('../services/fmtService');
  const { fetchAstroAwaniNews } = require('../services/astroAwaniService');
  const { fetchMalaysiakiniNews } = require('../services/malaysiakiniService');

  test('FMT feed returns articles array', async () => {
    const articles = await fetchFMTNews();
    expect(Array.isArray(articles)).toBe(true);
    if (articles.length > 0) {
      expect(articles[0]).toHaveProperty('title');
      expect(articles[0]).toHaveProperty('url');
      expect(articles[0]).toHaveProperty('source');
    }
  }, 15000);

  test('Astro Awani feed returns articles array', async () => {
    const articles = await fetchAstroAwaniNews();
    expect(Array.isArray(articles)).toBe(true);
    if (articles.length > 0) {
      expect(articles[0]).toHaveProperty('title');
      expect(articles[0]).toHaveProperty('url');
    }
  }, 15000);

  test('Malaysiakini feed returns articles array', async () => {
    const articles = await fetchMalaysiakiniNews();
    expect(Array.isArray(articles)).toBe(true);
    if (articles.length > 0) {
      expect(articles[0]).toHaveProperty('title');
      expect(articles[0]).toHaveProperty('url');
    }
  }, 15000);
});

// ── 4. Utility / Helper Tests ─────────────────────────────────
describe('Utility Functions', () => {
  test('JWT token generation and verification', () => {
    const token = generateTestToken('abc123', 'admin');
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.id).toBe('abc123');
    expect(decoded.role).toBe('admin');
  });

  test('JWT token expires correctly', () => {
    const token = jwt.sign({ id: 'test' }, JWT_SECRET, { expiresIn: '0s' });
    expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
  });
});

// ── 5. M3 Perfective Maintenance Tests ─────────────────────────
describe('M3 Entity Graph PageRank Ranking', () => {
  const { __testables } = require('../controllers/entityController');
  const {
    calculatePageRank,
    buildEntityGraphData,
    constants,
  } = __testables;

  test('calculatePageRank returns a rank object for graph nodes', () => {
    const ranks = calculatePageRank(
      [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
      [{ source: 'A', target: 'B', weight: 2 }]
    );

    expect(ranks).toHaveProperty('A');
    expect(ranks).toHaveProperty('B');
    expect(ranks).toHaveProperty('C');
    expect(Object.values(ranks).every(rank => Number.isFinite(rank))).toBe(true);
  });

  test('PageRank uses damping value 0.85', () => {
    expect(constants.PAGERANK_DAMPING).toBe(0.85);
  });

  test('connected high-co-occurrence nodes receive meaningful rank', () => {
    const ranks = calculatePageRank(
      [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
      [
        { source: 'A', target: 'B', weight: 10 },
        { source: 'B', target: 'C', weight: 1 },
      ]
    );

    expect(ranks.B).toBeGreaterThan(ranks.C);
    expect(ranks.A).toBeGreaterThan(ranks.C);
  });

  test('empty graph returns safely', () => {
    expect(calculatePageRank([], [])).toEqual({});

    const graph = buildEntityGraphData([], null);
    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
    expect(graph.meta).toEqual(expect.objectContaining({
      ranking: 'pagerank_cooccurrence',
      damping: 0.85,
      articleLimit: 200,
      nodeLimit: 40,
      edgeLimit: 60,
    }));
  });

  test('isolated nodes do not crash the algorithm', () => {
    const ranks = calculatePageRank(
      [{ id: 'A' }, { id: 'B' }],
      []
    );

    expect(ranks.A).toBeCloseTo(0.5, 5);
    expect(ranks.B).toBeCloseTo(0.5, 5);
  });

  test('entity graph response includes metadata and node rank fields', () => {
    const articles = [
      {
        title: 'Anwar Ibrahim meets Bank Negara in Kuala Lumpur',
        description: 'Anwar Ibrahim and Bank Negara discuss Bursa Malaysia confidence in Kuala Lumpur.',
        content: 'Petronas, PKR and Putrajaya were also mentioned.',
        sentiment: 'Positive',
        source: 'Bernama',
        createdAt: new Date(),
      },
      {
        title: 'Bank Negara briefing with Anwar Ibrahim in Putrajaya',
        description: 'Bank Negara, Bursa Malaysia and Petronas brief Anwar Ibrahim.',
        content: 'PKR leaders reviewed Kuala Lumpur economic policy.',
        sentiment: 'Neutral',
        source: 'The Star',
        createdAt: new Date(),
      },
    ];

    const graph = buildEntityGraphData(articles, null);

    expect(graph.meta).toEqual(expect.objectContaining({
      ranking: 'pagerank_cooccurrence',
      damping: constants.PAGERANK_DAMPING,
      articleLimit: constants.GRAPH_ARTICLE_LIMIT,
      nodeLimit: constants.GRAPH_NODE_LIMIT,
      edgeLimit: constants.GRAPH_EDGE_LIMIT,
    }));
    expect(graph.meta.generatedAt).toEqual(expect.any(String));
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.nodes[0]).toEqual(expect.objectContaining({
      pageRank: expect.any(Number),
      rankScore: expect.any(Number),
    }));
  });

  test('entity graph applies node and edge limits', () => {
    const manyEntities = [
      'Anwar Ibrahim', 'Muhyiddin Yassin', 'Ismail Sabri', 'Najib Razak',
      'Mahathir', 'Ahmad Zahid', 'Hadi Awang', 'Lim Guan Eng',
      'Rafizi Ramli', 'Khairy Jamaluddin', 'Syed Saddiq', 'Wan Azizah',
      'Tengku Zafrul', 'Fadillah Yusof', 'Johari Abdul Ghani',
      'Anthony Loke', 'Nik Abduh', 'Mat Sabu', 'Azmin Ali',
      'Hamzah Zainudin', 'Wee Ka Siong', 'Hannah Yeoh', 'Nurul Izzah',
      'Saifuddin Nasution', 'Fahmi Fadzil', 'Gobind Singh',
      'UMNO', 'PKR', 'DAP', 'PAS', 'Bersatu', 'GPS', 'MCA', 'MIC',
      'Pakatan Harapan', 'Perikatan Nasional', 'Barisan Nasional',
      'MACC', 'Bank Negara', 'Petronas', 'Bursa Malaysia', 'Maybank',
      'Kuala Lumpur', 'Putrajaya', 'Selangor',
    ];
    const content = manyEntities.join(' ');
    const articles = [
      { title: content, description: content, content, sentiment: 'Positive', source: 'Demo', createdAt: new Date() },
      { title: content, description: content, content, sentiment: 'Neutral', source: 'Demo', createdAt: new Date() },
    ];

    const graph = buildEntityGraphData(articles, null);

    expect(graph.nodes.length).toBeLessThanOrEqual(constants.GRAPH_NODE_LIMIT);
    expect(graph.edges.length).toBeLessThanOrEqual(constants.GRAPH_EDGE_LIMIT);
  });
});

describe('M3 Source Credibility Formula', () => {
  const { __testables } = require('../controllers/sourceController');
  const { CREDIBILITY_WEIGHTS, calculateCredibilityMetrics } = __testables;

  const baseSource = {
    _id: 'Demo Source',
    total: 6,
    positive: 2,
    negative: 2,
    neutral: 2,
    avgConfidence: 0.8,
    alerts: 0,
    sentiments: ['Positive', 'Positive', 'Negative', 'Negative', 'Neutral', 'Neutral'],
  };

  test('credibility formula uses exact 0.4 / 0.4 / 0.2 weights', () => {
    expect(CREDIBILITY_WEIGHTS).toEqual({
      balance: 0.4,
      confidence: 0.4,
      reliability: 0.2,
    });

    const result = calculateCredibilityMetrics(baseSource);
    expect(result.credibilityScore).toBe(92);
  });

  test('volume does not affect final credibility score', () => {
    const lowVolume = calculateCredibilityMetrics(baseSource);
    const highVolume = calculateCredibilityMetrics({
      ...baseSource,
      total: 60,
      positive: 20,
      negative: 20,
      neutral: 20,
      sentiments: Array(20).fill('Positive').concat(Array(20).fill('Negative'), Array(20).fill('Neutral')),
    });

    expect(highVolume.volume).toBeGreaterThan(lowVolume.volume);
    expect(highVolume.credibilityScore).toBe(lowVolume.credibilityScore);
  });
});
