# Adaptive Maintenance — News Source Feeds

> **Adaptive maintenance** = changing the software *not because it has a bug*,
> but because something in its **external environment** changed. In this project
> the external environment is the set of **vendors** — the news publishers whose
> feeds we consume but do not control.

---

## 1. What is a "vendor" in this project?

A **vendor** is any external service we read data from but do not own. We pull
RSS/Atom feeds from Malaysian news publishers and send article text to an AI
service for sentiment. When *they* change something, *we* must adapt.

| Vendor | What we consume | Registry key |
|---|---|---|
| Astro Awani | RSS feed | `astro_awani` |
| Malaysiakini | RSS feed | `malaysiakini` |
| Free Malaysia Today (FMT) | RSS feed | `fmt` |
| OpenAI | sentiment API | _(see `services/openaiService.js`)_ |

Because we don't control these servers, three kinds of change force maintenance:

1. **Endpoint change** — a vendor moves or renames a feed URL.
2. **Response-format change** — a vendor changes the feed dialect (RSS→Atom),
   renames/moves a tag, or drops a field.
3. **New source** — we decide to add another publisher.

This document is the playbook for all three. The design goal: **each task is a
config edit, not a code change**, and **breakage is detected by logs, not by
users**.

---

## 2. Architecture (where everything lives)

```
backend/
├── config/
│   └── newsSources.js      ← SINGLE SOURCE OF TRUTH: the vendor registry
├── services/
│   ├── rssService.js       ← resilient fetch + parse + health checks
│   ├── astroAwaniService.js┐
│   ├── malaysiakiniService.js  ← thin wrappers (back-compat only)
│   └── fmtService.js       ┘
└── controllers/
    └── newsController.js    ← calls fetchAllSources(); no per-vendor code
```

**Data flow**

```
newsSources.js (config)
      │  getEnabledSources()
      ▼
rssService.fetchAllSources()
      │  for each vendor: fetchFeedText() → parse() → detectFeedItems() → map fields
      │  assessHealth()  ──► logs 🚨 if a feed looks broken
      ▼
normalised articles  →  newsController  →  sentiment  →  /api/news response
```

**Normalised article shape** (the stable internal contract — never changes even
when a vendor's format does):

```js
{ title, description, url, urlToImage, publishedAt, source, content, provider }
```

---

## 3. How resilience is built in

All of this lives in [`services/rssService.js`](../services/rssService.js).

| Risk (vendor change) | Mechanism | Effect |
|---|---|---|
| URL moved / migrating | `fallbackUrls[]` + per-URL retry | Old URL keeps working while the new one is verified |
| Transient 5xx / timeout | Exponential-backoff retry (3 attempts) | Rides out blips instead of returning empty |
| Feed dialect changed (RSS↔Atom↔RDF) | `detectFeedItems()` with `format: 'auto'` | No code change needed |
| Tag renamed / moved | `FIELD_MAP` ordered candidate lists + per-vendor `fieldMap` override | Tolerated if any known alias is present |
| Atom `<link href>` vs RSS text link | `resolveLink()` | Both handled |
| Image embedded differently | `resolveImage()` (media/enclosure/inline `<img>`/fallback) | Best-effort, never crashes |
| Feed silently empty/broken | `assessHealth()` | Loud `🚨 [ADAPTIVE-MAINTENANCE]` log naming the vendor |
| One vendor down | `fetchAllSources()` isolates failures to `[]` | Other vendors still return |

### The early-warning log

When a feed parses but yields no items, or items are missing titles/links above
a threshold, you'll see this in the server logs:

```
🚨 [ADAPTIVE-MAINTENANCE] Vendor "Malaysiakini" feed looks broken (format unknown).
   Likely a vendor-side change — check the feed and update backend/config/newsSources.js.
    • no items found — endpoint or feed format may have changed
```

This is the signal to start an adaptive-maintenance task. **Watch your logs for
`[ADAPTIVE-MAINTENANCE]`.**

### The health endpoint (dashboard view)

Logs are easy to miss, so the same health data is exposed as an admin API.
`rssService` keeps an in-memory record of the last fetch result per vendor; the
endpoint reports it.

```
GET /api/admin/source-health           (admin only)
GET /api/admin/source-health?probe=true   ← actively re-fetch all feeds first
```

Example response:

```json
{
  "success": true,
  "checkedLive": true,
  "summary": { "total": 3, "healthy": 2, "degraded": 0, "down": 1, "unknown": 0 },
  "sources": [
    { "key": "astro_awani", "name": "Astro Awani", "status": "healthy",
      "kind": "rss", "returned": 15, "issues": [], "checkedAt": "2026-06-01T..." },
    { "key": "malaysiakini", "name": "Malaysiakini", "status": "down",
      "kind": "unreachable", "returned": 0,
      "issues": ["fetch failed: timeout of 5000ms exceeded"], "checkedAt": "..." }
  ]
}
```

**Status meanings**

| `status` | Meaning | Action |
|---|---|---|
| `healthy` | Feed parsed, items have titles + links | none |
| `degraded` | Feed parsed but many items missing fields | Playbook B (format change) |
| `down` | Feed unreachable after retries + fallbacks | Playbook A (endpoint change) |
| `unknown` | Not fetched yet this server run | hit `?probe=true` to check |

> Without `?probe=true` the endpoint returns the last-known runtime state
> (instant, no network). With `?probe=true` it re-fetches every feed live —
> use it as a manual "check all feeds now" button on the admin dashboard.

---

## 4. Playbook A — a vendor changed their **endpoint** (URL)

**Symptom:** logs show `❌ [<vendor>] RSS fetch failed` or `🚨 … no items found`.

1. Open the feed URL in a browser to find the new location.
2. Edit only that vendor's entry in
   [`config/newsSources.js`](../config/newsSources.js):

   ```js
   {
     key: 'fmt',
     name: 'Free Malaysia Today (Direct)',
     url: 'https://www.freemalaysiatoday.com/NEW-feed-path/',   // ← updated
     fallbackUrls: ['https://www.freemalaysiatoday.com/feed/'], // ← keep old during migration
     provider: 'fmt_direct',
     fallbackImage: '...',
     format: 'auto',
     enabled: true,
   }
   ```
3. Verify: `npm test -- -t "RSS Feed Services"` (or hit `/api/news?refresh=true`).
4. Once the new URL is stable, remove `fallbackUrls`.

---

## 5. Playbook B — a vendor changed their **response format**

**Symptom:** articles return but with `No Title`, empty links, or wrong dates;
`🚨` health warning fires about missing title/link.

1. Fetch the raw feed and inspect the new XML structure.
2. **If they switched dialect (RSS↔Atom↔RDF):** usually nothing to do —
   `format: 'auto'` detects it. If detection is ambiguous, pin it explicitly:
   `format: 'atom'`.
3. **If they renamed/moved a tag** (e.g. `<description>` → `<summary>`), add a
   `fieldMap` override for just that field on the vendor's entry. Each value is
   an ordered candidate list; the first present tag wins:

   ```js
   {
     key: 'astro_awani',
     name: 'Astro Awani',
     url: '...',
     provider: 'astro_awani_direct',
     fallbackImage: '...',
     format: 'auto',
     enabled: true,
     fieldMap: {
       description: ['summary', 'description'],   // new tag first
       pubDate:     ['published', 'pubDate'],
     },
   }
   ```

   You only override the fields that changed; everything else keeps the
   resilient defaults from `FIELD_MAP` in `rssService.js`.
4. Verify with the tests / a `refresh=true` request and confirm the `🚨` log is gone.

> Add a new alias to the **shared** `FIELD_MAP` only when the alias is generic
> and should apply to *all* vendors. Vendor-specific quirks belong in that
> vendor's `fieldMap`.

---

## 6. Playbook C — **add a new source**

Append **one object** to `SOURCES` in
[`config/newsSources.js`](../config/newsSources.js). That's the whole task —
`fetchAllSources()`, the `/api/news` pipeline, and the test suite pick it up
automatically.

```js
{
  key: 'the_star',
  name: 'The Star',
  url: 'https://www.thestar.com.my/rss/News',
  provider: 'the_star_direct',
  fallbackImage: 'https://www.thestar.com.my/favicon.ico',
  format: 'auto',
  enabled: true,
}
```

Optional but recommended:
- If the new publisher has a Malaysian domain, add it to `MALAYSIA_SOURCE_HINTS`
  and `extractSourceFromUrl()` in
  [`controllers/newsController.js`](../controllers/newsController.js) so its
  articles are correctly attributed and Malaysia-scoped.
- Add a smoke test mirroring the existing ones in
  [`__tests__/api.test.js`](../__tests__/api.test.js).

To temporarily disable a flaky vendor without deleting its config, set
`enabled: false`.

---

## 7. Verification checklist (run after any change)

```bash
cd backend
npm test -- -t "RSS Feed Services"   # live-feed smoke test (skips gracefully if a feed is empty)
```

- [ ] Target vendor returns a non-empty array with `title`, `url`, `source`.
- [ ] No `🚨 [ADAPTIVE-MAINTENANCE]` warning in the server log for that vendor.
- [ ] `/api/news?refresh=true` returns articles from the expected sources.

---

## 8. Design principles applied

- **Open/Closed Principle** — the system is *open to extension* (new vendors via
  config) but *closed to modification* (no fetch/parse/controller code edits).
- **Single Source of Truth** — every vendor fact lives in one registry file.
- **Fail soft, log loud** — a broken vendor degrades gracefully (`[]`) but is
  announced clearly, so maintenance is proactive rather than user-reported.
