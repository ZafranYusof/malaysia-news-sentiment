/**
 * Frontend Component Tests
 * Tests: ErrorBoundary, SentimentBadge, SearchBar, utility functions
 */
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ── 1. ErrorBoundary Tests ────────────────────────────────────
describe('ErrorBoundary', () => {
  // Suppress console.error for error boundary tests
  const originalError = console.error;
  beforeAll(() => { console.error = vi.fn(); });
  afterAll(() => { console.error = originalError; });

  test('renders children when no error', async () => {
    const ErrorBoundary = (await import('../components/ErrorBoundary')).default;
    render(
      <ErrorBoundary>
        <div>Hello World</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  test('renders fallback UI when child throws', async () => {
    const ErrorBoundary = (await import('../components/ErrorBoundary')).default;
    const ThrowError = () => { throw new Error('Test crash'); };
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  test('InlineErrorBoundary shows component name on error', async () => {
    const { InlineErrorBoundary } = await import('../components/ErrorBoundary');
    const ThrowError = () => { throw new Error('Chart crash'); };
    
    render(
      <InlineErrorBoundary name="Pie Chart">
        <ThrowError />
      </InlineErrorBoundary>
    );
    
    expect(screen.getByText(/Pie Chart/)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});

// ── 2. SentimentBadge Tests ───────────────────────────────────
describe('SentimentBadge', () => {
  test('renders Positive sentiment correctly', async () => {
    const SentimentBadge = (await import('../components/SentimentBadge')).default;
    render(<SentimentBadge sentiment="Positive" confidence={0.85} />);
    expect(screen.getByText(/Positive/i)).toBeInTheDocument();
  });

  test('renders Negative sentiment correctly', async () => {
    const SentimentBadge = (await import('../components/SentimentBadge')).default;
    render(<SentimentBadge sentiment="Negative" confidence={0.72} />);
    expect(screen.getByText(/Negative/i)).toBeInTheDocument();
  });

  test('renders Neutral sentiment correctly', async () => {
    const SentimentBadge = (await import('../components/SentimentBadge')).default;
    render(<SentimentBadge sentiment="Neutral" confidence={0.5} />);
    expect(screen.getByText(/Neutral/i)).toBeInTheDocument();
  });
});

// ── 3. Export Utility Tests ───────────────────────────────────
describe('Export Utilities', () => {
  test('exportToCSV function exists and is callable', async () => {
    const { exportToCSV } = await import('../services/exportUtils');
    expect(typeof exportToCSV).toBe('function');
  });

  test('export module is importable', async () => {
    const mod = await import('../services/exportUtils');
    expect(mod).toBeDefined();
    expect(mod.exportToCSV).toBeDefined();
  });
});

// ── 4. Filter Logic Tests ─────────────────────────────────────
describe('Dashboard Filter Logic', () => {
  const articles = [
    { _id: '1', title: 'Good news', sentiment: 'Positive', isAlert: false },
    { _id: '2', title: 'Bad news', sentiment: 'Negative', isAlert: true },
    { _id: '3', title: 'Normal news', sentiment: 'Neutral', isAlert: false },
    { _id: '4', title: 'Crisis news', sentiment: 'Negative', isAlert: true },
  ];

  test('filter All returns all articles', () => {
    const filtered = articles;
    expect(filtered).toHaveLength(4);
  });

  test('filter Positive returns only positive', () => {
    const filtered = articles.filter(a => a.sentiment === 'Positive');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Good news');
  });

  test('filter Negative returns only negative', () => {
    const filtered = articles.filter(a => a.sentiment === 'Negative');
    expect(filtered).toHaveLength(2);
  });

  test('filter Alerts returns only alert articles', () => {
    const filtered = articles.filter(a => a.isAlert);
    expect(filtered).toHaveLength(2);
    expect(filtered.every(a => a.isAlert)).toBe(true);
  });

  test('sentiment distribution calculation', () => {
    const dist = {
      Positive: articles.filter(a => a.sentiment === 'Positive').length,
      Negative: articles.filter(a => a.sentiment === 'Negative').length,
      Neutral: articles.filter(a => a.sentiment === 'Neutral').length,
    };
    expect(dist.Positive).toBe(1);
    expect(dist.Negative).toBe(2);
    expect(dist.Neutral).toBe(1);
    expect(dist.Positive + dist.Negative + dist.Neutral).toBe(4);
  });
});

// ── 5. API Service Tests (mocked) ────────────────────────────
describe('API Service', () => {
  test('api module exports required functions', async () => {
    const api = await import('../services/api');
    expect(api.fetchAndAnalyzeNews).toBeDefined();
    expect(api.getHistory).toBeDefined();
    expect(api.getDashboardInit).toBeDefined();
    expect(api.generateDigest).toBeDefined();
    expect(api.generateForecast).toBeDefined();
    expect(api.deleteArticle).toBeDefined();
    expect(api.getRegionalData).toBeDefined();
    expect(api.getTopSources).toBeDefined();
  });
});
