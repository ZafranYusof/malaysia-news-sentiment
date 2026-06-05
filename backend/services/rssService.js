const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const { getEnabledSources, getSourceByKey } = require('../config/newsSources');

/**
 * Resilient RSS / Atom fetcher. Reads external news vendor feeds and converts
 * them to one normalised article shape. Built to survive vendor changes:
 * fallback URLs + retry for endpoint changes, format auto-detection and field
 * aliases for format changes, and a health check that warns on broken feeds.
 *
 * Normalised article: { title, description, url, urlToImage, publishedAt,
 * source, content, provider }
 *
 * @typedef {Object} SourceConfig
 * @property {string} key
 * @property {string} name
 * @property {string} url
 * @property {string[]} [fallbackUrls]
 * @property {string} provider
 * @property {string} fallbackImage
 * @property {'auto'|'rss'|'atom'|'rdf'} [format]
 * @property {boolean} [enabled]
 * @property {Object<string,string[]>} [fieldMap]
 * @property {number} [limit]
 * @property {number} [timeout]
 */

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

// Candidate XML tags per field, in priority order (covers RSS 2.0, RSS 1.0/RDF,
// Atom). First tag present wins. A vendor can override these via source.fieldMap.
const FIELD_MAP = {
  title:       ['title'],
  link:        ['link', 'guid', 'id'],
  description: ['description', 'summary', 'content:encoded', 'content', 'dc:description'],
  content:     ['content:encoded', 'content', 'description', 'summary'],
  pubDate:     ['pubDate', 'published', 'updated', 'dc:date', 'date'],
};

const RETRY = { attempts: 3, baseDelayMs: 400 };

// In-memory record of the last fetch result per source, surfaced by
// GET /api/admin/source-health. Resets on server restart.
const sourceHealth = new Map();

const recordHealth = (key, record) => {
  if (key) sourceHealth.set(key, record);
};

// ── Small pure helpers ────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Strip HTML tags from a string. */
const stripHtml = (s) => String(s ?? '').replace(/<[^>]*>?/gm, '');

/** Coerce a parsed tag (string, array, or { '#text', '@_attr' } object) to a string. */
const textOf = (val) => {
  if (val == null) return '';
  if (Array.isArray(val)) return textOf(val[0]);
  if (typeof val === 'object') return String(val['#text'] ?? '');
  return String(val);
};

/** Return the value of the first candidate key that exists on `item`. */
const firstField = (item, candidates) => {
  for (const key of candidates) {
    const v = item[key];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
};

/** Resolve a URL from an item — handles RSS text links and Atom <link href>. */
const resolveLink = (raw) => {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) {
    const alt = raw.find((l) => l && (l['@_rel'] === 'alternate' || !l['@_rel']));
    return resolveLink(alt || raw[0]);
  }
  if (typeof raw === 'object') return raw['@_href'] || textOf(raw);
  return String(raw);
};

/** Best-effort image extraction across the many ways feeds embed images. */
const resolveImage = (item, htmlContent, fallbackImage) => {
  const media = item['media:content'] || item['media:thumbnail'] || item['enclosure'] || {};
  const mediaNode = Array.isArray(media) ? media[0] : media;
  if (mediaNode && mediaNode['@_url']) return mediaNode['@_url'];

  const imgMatch = String(htmlContent || '').match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) return imgMatch[1];

  return fallbackImage || '';
};

/**
 * Locate the feed items regardless of dialect (RSS 2.0, RSS 1.0/RDF, Atom).
 * Returns { items, kind }. This is what lets a vendor switch format safely.
 */
const detectFeedItems = (root, forced) => {
  const asArray = (x) => (Array.isArray(x) ? x : x ? [x] : []);

  const tryRss = () => asArray(root?.rss?.channel?.item);
  const tryRdf = () => asArray(root?.['rdf:RDF']?.item || root?.RDF?.item);
  const tryAtom = () => asArray(root?.feed?.entry);

  if (forced === 'rss')  return { items: tryRss(),  kind: 'rss' };
  if (forced === 'rdf')  return { items: tryRdf(),  kind: 'rdf' };
  if (forced === 'atom') return { items: tryAtom(), kind: 'atom' };

  // 'auto' (default): probe each dialect, return the first that yields items.
  const rss = tryRss();
  if (rss.length) return { items: rss, kind: 'rss' };
  const atom = tryAtom();
  if (atom.length) return { items: atom, kind: 'atom' };
  const rdf = tryRdf();
  if (rdf.length) return { items: rdf, kind: 'rdf' };

  return { items: [], kind: 'unknown' };
};

// ── HTTP with retry + URL fallback ─────────────────────────────────────────

/**
 * GET a feed, trying `url` then each `fallbackUrls` entry, with
 * exponential-backoff retries per URL. Throws only if every URL fails.
 */
const fetchFeedText = async ({ url, fallbackUrls = [], timeout, sourceName }) => {
  const urls = [url, ...fallbackUrls].filter(Boolean);
  let lastError;

  for (const candidate of urls) {
    for (let attempt = 1; attempt <= RETRY.attempts; attempt++) {
      try {
        const response = await axios.get(candidate, {
          timeout,
          headers: { 'User-Agent': USER_AGENT },
        });
        if (candidate !== url) {
          console.warn(`⚠️  [${sourceName}] primary URL failed; served from fallback: ${candidate}`);
        }
        return response.data;
      } catch (error) {
        lastError = error;
        const transient = !error.response || error.response.status >= 500 || error.code === 'ECONNABORTED';
        if (attempt < RETRY.attempts && transient) {
          await sleep(RETRY.baseDelayMs * attempt);
          continue;
        }
        break; // non-transient (e.g. 404) → stop retrying this URL, try next URL
      }
    }
  }
  throw lastError || new Error('All feed URLs failed');
};

/** Inspect parsed output and warn when a feed looks broken. Returns a health object. */
const assessHealth = ({ sourceName, kind, rawCount, articles }) => {
  const issues = [];

  if (kind === 'unknown' || rawCount === 0) {
    issues.push('no items found — endpoint or feed format may have changed');
  }
  const missingTitle = articles.filter((a) => a.title === 'No Title').length;
  const missingUrl = articles.filter((a) => !a.url).length;
  if (rawCount > 0 && missingUrl / rawCount > 0.5) {
    issues.push(`${missingUrl}/${rawCount} items missing a link — link tag may have been renamed`);
  }
  if (rawCount > 0 && missingTitle / rawCount > 0.5) {
    issues.push(`${missingTitle}/${rawCount} items missing a title — title tag may have been renamed`);
  }

  if (issues.length) {
    console.warn(
      `🚨 [ADAPTIVE-MAINTENANCE] Vendor "${sourceName}" feed looks broken (format ${kind}). ` +
      `Likely a vendor-side change — check the feed and update backend/config/newsSources.js.\n` +
      issues.map((i) => `    • ${i}`).join('\n')
    );
  }

  return { sourceName, healthy: issues.length === 0, kind, rawCount, returned: articles.length, issues };
};

/**
 * Fetch and parse one vendor feed into normalised articles. Never throws — on
 * failure it logs and returns [], so one bad vendor can't break /api/news.
 * @param {SourceConfig} config
 * @returns {Promise<Array<Object>>}
 */
const fetchRSS = async (config) => {
  const {
    key,
    url,
    fallbackUrls = [],
    sourceName,
    provider,
    fallbackImage,
    format = 'auto',
    fieldMap = {},
    limit = 15,
    timeout = 5000,
  } = config;
  const healthKey = key || sourceName;

  // Merge per-vendor field overrides on top of the resilient defaults.
  const map = { ...FIELD_MAP, ...fieldMap };

  try {
    const data = await fetchFeedText({ url, fallbackUrls, timeout, sourceName });
    const root = parser.parse(data);
    const { items, kind } = detectFeedItems(root, format === 'auto' ? undefined : format);

    const articles = items.slice(0, limit).map((item) => {
      const rawContent = textOf(firstField(item, map.content));
      const rawDesc = textOf(firstField(item, map.description));
      const title = textOf(firstField(item, map.title));
      const link = resolveLink(firstField(item, map.link));
      const pub = textOf(firstField(item, map.pubDate));
      const parsedDate = pub ? new Date(pub) : new Date();

      return {
        title:       title ? stripHtml(title) : 'No Title',
        description: stripHtml(rawDesc).slice(0, 300),
        url:         link,
        urlToImage:  resolveImage(item, rawContent || rawDesc, fallbackImage),
        publishedAt: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
        source:      sourceName,
        content:     rawContent || rawDesc || '',
        provider,
      };
    });

    const health = assessHealth({ sourceName, kind, rawCount: items.length, articles });
    recordHealth(healthKey, {
      key: healthKey,
      name: sourceName,
      url,
      checkedAt: new Date().toISOString(),
      status: health.healthy ? 'healthy' : 'degraded',
      ...health,
    });
    return articles;
  } catch (error) {
    console.error(`❌ [${sourceName}] RSS fetch failed after retries/fallbacks:`, error.message);
    recordHealth(healthKey, {
      key: healthKey,
      name: sourceName,
      url,
      checkedAt: new Date().toISOString(),
      status: 'down',
      healthy: false,
      kind: 'unreachable',
      rawCount: 0,
      returned: 0,
      issues: [`fetch failed: ${error.message}`],
    });
    return [];
  }
};

/**
 * Fetch a single registered source by its registry `key`.
 * @param {string} key
 * @returns {Promise<Array<Object>>}
 */
const fetchSource = (key) => {
  const cfg = getSourceByKey(key);
  if (!cfg) {
    console.warn(`⚠️  fetchSource: unknown source key "${key}"`);
    return Promise.resolve([]);
  }
  return fetchRSS({ ...cfg, sourceName: cfg.name });
};

/**
 * Fetch every enabled source concurrently and return one merged array. A new
 * source in newsSources.js flows through automatically; a failing vendor → [].
 * @returns {Promise<Array<Object>>}
 */
const fetchAllSources = async () => {
  const sources = getEnabledSources();
  const batches = await Promise.all(
    sources.map((cfg) => fetchRSS({ ...cfg, sourceName: cfg.name }).catch(() => []))
  );
  return batches.flat();
};

/**
 * Return last-known health for every enabled source (status 'unknown' if not
 * yet fetched this runtime).
 * @returns {{ summary: Object, sources: Array<Object> }}
 */
const getSourcesHealth = () => {
  const sources = getEnabledSources().map((cfg) => {
    const last = sourceHealth.get(cfg.key);
    if (last) return last;
    return {
      key: cfg.key,
      name: cfg.name,
      url: cfg.url,
      checkedAt: null,
      status: 'unknown',
      healthy: null,
      kind: null,
      rawCount: 0,
      returned: 0,
      issues: ['not fetched yet this runtime'],
    };
  });

  const summary = {
    total: sources.length,
    healthy: sources.filter((s) => s.status === 'healthy').length,
    degraded: sources.filter((s) => s.status === 'degraded').length,
    down: sources.filter((s) => s.status === 'down').length,
    unknown: sources.filter((s) => s.status === 'unknown').length,
  };

  return { summary, sources };
};

/**
 * Fetch every enabled source now, then return the fresh health snapshot.
 * @returns {Promise<{ summary: Object, sources: Array<Object> }>}
 */
const probeAllSources = async () => {
  await fetchAllSources();
  return getSourcesHealth();
};

module.exports = { fetchRSS, fetchSource, fetchAllSources, getSourcesHealth, probeAllSources };
