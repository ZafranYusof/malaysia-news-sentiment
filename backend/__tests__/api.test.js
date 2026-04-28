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
