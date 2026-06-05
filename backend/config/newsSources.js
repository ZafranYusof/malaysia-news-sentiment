/**
 * News source registry — the single list of external vendors (Astro Awani,
 * Malaysiakini, FMT, ...) the app ingests from. To add a source, append one
 * entry; to handle a vendor changing its URL or format, edit its entry only.
 *
 * Each entry: key, name, url, provider, fallbackImage, format ('auto' detects
 * RSS/Atom/RDF), enabled. Optional: fallbackUrls[] (tried if url fails),
 * fieldMap (override which XML tags to read for non-standard vendors).
 */
const SOURCES = [
  {
    key: 'astro_awani',
    name: 'Astro Awani',
    url: 'https://www.astroawani.com/rss/latest/public',
    provider: 'astro_awani_direct',
    fallbackImage: 'https://www.astroawani.com/static/icons8-astro-awani-100.png',
    format: 'auto',
    enabled: true,
  },
  {
    key: 'malaysiakini',
    name: 'Malaysiakini',
    url: 'https://www.malaysiakini.com/rss/en/news.rss',
    provider: 'malaysiakini_direct',
    fallbackImage: 'https://www.malaysiakini.com/favicon-96x96.png',
    format: 'auto',
    enabled: true,
  },
  {
    key: 'fmt',
    name: 'Free Malaysia Today (Direct)',
    url: 'https://www.freemalaysiatoday.com/feed/',
    provider: 'fmt_direct',
    fallbackImage: 'https://www.freemalaysiatoday.com/wp-content/uploads/2018/10/fmt-logo-new.png',
    format: 'auto',
    enabled: true,
  },
];

/** Return every source whose `enabled` flag is true. */
const getEnabledSources = () => SOURCES.filter((s) => s.enabled !== false);

/** Look up a single source config by its `key`. Returns undefined if not found. */
const getSourceByKey = (key) => SOURCES.find((s) => s.key === key);

module.exports = { SOURCES, getEnabledSources, getSourceByKey };
