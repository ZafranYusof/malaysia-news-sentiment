const OpenAI = require('openai');
const Sentiment = require('sentiment');
const axios = require('axios');

// Local fallback analyser (keyword-based, no API needed)
const localAnalyser = new Sentiment();

// Lazy-init OpenAI
let openai = null;
const { GoogleGenerativeAI } = require('@google/generative-ai');

const getClient = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    const baseURL = process.env.OPENAI_BASE_URL || undefined;
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL,
    });
  }
  return openai;
};

// Lazy-init Gemini
let genAI = null;
const getGeminiModel = (modelName = 'gemini-2.0-flash') => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: modelName });
};

const isOllamaCloud = () => (process.env.OPENAI_BASE_URL || '').includes('ollama.com/api');

const extractJsonObject = (raw) => {
  if (!raw) return null;
  const trimmed = String(raw)
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return null;
  return trimmed.slice(firstBrace, lastBrace + 1);
};

/**
 * Universal Request Handler
 * Tries Gemini first (if key exists), then fallback to OpenAI/Ollama
 */
const performAiRequest = async (prompt, model, temperature = 0.2, max_tokens = 500, extraBody = {}) => {
  const baseURL = process.env.OPENAI_BASE_URL || '';
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) throw new Error('No AI API keys configured (Gemini or OpenAI/Ollama)');

  // Case 1: Ollama Cloud Native API (/api/generate)
  if (baseURL.includes('ollama.com/api')) {
    const res = await axios.post(`${baseURL}/generate`, {
      model,
      prompt,
      stream: false,
      ...extraBody,
      options: {
        temperature,
        num_predict: max_tokens,
      },
    }, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 90000,
    });
    return res.data.response;
  }

  // Case 2: Standard OpenAI-Compatible API
  const client = getClient();
  if (!client) throw new Error('OpenAI client not initialized');
  
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens,
  });
  return completion.choices[0].message.content;
};

/**
 * Local keyword-based fallback (instant, free)
 */
const localSentiment = (title, description) => {
  const text = `${title} ${description || ''}`.toLowerCase();
  const result = localAnalyser.analyze(text);
  let score = result.score;

  const MALAY_POS = [
    'bagus', 'baik', 'bangga', 'menang', 'berjaya', 'syukur', 'ceria', 'untung', 'maju',
    'pulih', 'lancar', 'hebat', 'senang', 'selamat', 'bantu', 'hadiah', 'bonus', 'setuju',
    'gemilang', 'syabas', 'tahniah', 'naik', 'positif', 'aman', 'sejahtera', 'kukuh', 'mantap', 'bijak', 'adil',
  ];
  const MALAY_NEG = [
    'buruk', 'gagal', 'mati', 'kematian', 'banjir', 'kemelut', 'krisis', 'masalah', 'rugi',
    'sedih', 'takut', 'bahaya', 'sakit', 'gaduh', 'marah', 'rosak', 'hancur', 'rasuah',
    'salah', 'jenayah', 'rompak', 'bunuh', 'protes', 'demo', 'bantah', 'kecewa',
    'jatuh', 'lemah', 'kecam', 'hina', 'fitnah', 'zalim', 'parah', 'tenat', 'susah', 'miskin', 'derita',
  ];

  MALAY_POS.forEach((w) => { if (text.includes(w)) score += 2; });
  MALAY_NEG.forEach((w) => { if (text.includes(w)) score -= 2; });

  let sentiment = 'Neutral';
  if (score >= 2) sentiment = 'Positive';
  else if (score <= -2) sentiment = 'Negative';

  const confidence = Math.min(Math.abs(score) / 10, 0.85);
  const isAlert = result.negative.some((w) => ['crisis', 'flood', 'disaster', 'emergency', 'attack', 'dead'].includes(w))
    || ['banjir', 'krisis', 'kecemasan', 'bahaya', 'mati', 'perang', 'gaduh', 'protes'].some((w) => text.includes(w));

  const MALAYSIAN_STATES = ['johor', 'kedah', 'kelantan', 'melaka', 'negeri sembilan', 'pahang', 'perak', 'perlis', 'pulau pinang', 'sabah', 'sarawak', 'selangor', 'terengganu', 'kuala lumpur', 'putrajaya', 'labuan'];
  const stateFound = MALAYSIAN_STATES.find((s) => text.includes(s)) || 'General';
  const processedState = stateFound.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    sentiment,
    confidence: parseFloat(confidence.toFixed(2)),
    reason: `Bilingual keyword analysis: Found ${score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'} indicators in text.`,
    analysis_source: 'local',
    isAlert,
    stateLocation: processedState === 'General' ? 'General' : processedState,
  };
};

/**
 * Detect if text is likely Bahasa Malaysia
 */
const isMalayText = (text) => {
  const MALAY_MARKERS = ['yang','dan','di','dengan','untuk','ini','itu','adalah',
    'kepada','tidak','boleh','akan','telah','oleh','dalam','bagi','pada',
    'kerajaan','rakyat','negara','bahawa','menteri','perdana'];
  const words = text.toLowerCase().split(/\s+/);
  const hits = words.filter(w => MALAY_MARKERS.includes(w)).length;
  return hits >= 2;
};

/**
 * Try Malaya NLP microservice (Python/FastAPI, port 8001)
 * Includes health check caching to avoid repeated timeouts when service is down.
 */
let _nlpHealthy = null;       // null = unknown, true/false = cached status
let _nlpHealthCheckedAt = 0;  // timestamp of last health check
const NLP_HEALTH_TTL = 60000; // re-check every 60s

const isNlpServiceHealthy = async () => {
  const now = Date.now();
  if (_nlpHealthy !== null && (now - _nlpHealthCheckedAt) < NLP_HEALTH_TTL) {
    return _nlpHealthy;
  }
  const NLP_URL = process.env.NLP_SERVICE_URL || process.env.MALAYA_URL || 'http://localhost:8001';
  try {
    const res = await axios.get(`${NLP_URL}/`, { timeout: 2000 });
    _nlpHealthy = res.data?.status === 'healthy';
  } catch {
    _nlpHealthy = false;
  }
  _nlpHealthCheckedAt = now;
  if (!_nlpHealthy) console.log('[NLP] Malaya service unavailable — using AI/local fallback.');
  return _nlpHealthy;
};

const tryMalayaNlp = async (text) => {
  // Skip if service was recently down (avoid timeout delays)
  const healthy = await isNlpServiceHealthy();
  if (!healthy) return null;

  const NLP_URL = process.env.NLP_SERVICE_URL || process.env.MALAYA_URL || 'http://localhost:8001';
  try {
    const res = await axios.post(`${NLP_URL}/sentiment`, { text, language: 'auto' }, { timeout: 5000 });
    const { sentiment, confidence, method } = res.data;
    const valid = ['Positive', 'Negative', 'Neutral'];
    if (!valid.includes(sentiment)) return null;
    return { sentiment, confidence, reason: `Malaya NLP (${method}): ${sentiment}`, analysis_source: 'malaya', isAlert: false, stateLocation: 'General' };
  } catch (err) {
    console.warn(`[NLP] Malaya request failed: ${err.message}`);
    _nlpHealthy = false;
    _nlpHealthCheckedAt = Date.now();
    return null;
  }
};

/**
 * Sentiment analysis - bilingual EN + BM
 */
const analyzeSentiment = async (title, description) => {
  const text = `Title: ${title}\nDescription: ${description || 'No description available'}`;

  // ── Tier 1: Malaya NLP Service (handles BM & mixed BM/EN) ───
  const rawText = `${title} ${description || ''}`;
  const malayaResult = await tryMalayaNlp(rawText);
  if (malayaResult) {
    // Enrich with alert & location detection from local analysis
    const localEnrich = localSentiment(title, description);
    malayaResult.isAlert = localEnrich.isAlert;
    malayaResult.stateLocation = localEnrich.stateLocation;
    return malayaResult;
  }

  // ── Tier 2: Local rule-based (no API needed) ─────────────────
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_')) {
    return localSentiment(title, description);
  }

  const prompt = `You are a Malaysian news sentiment analyst.
Return ONLY one valid JSON object. No markdown. No text outside JSON.
Classify the article as Positive, Negative, or Neutral.
Rules:
- Floods, accidents, corruption, crime, price hikes, and unresolved grievances are usually Negative.
- Aid, recovery, development, success, and celebrations are usually Positive.
- If a bad event is paired with strong corrective government action, Neutral or Positive is allowed.
Use this exact schema:
{
  "sentiment": "Positive",
  "confidence": 0.75,
  "reason": "Short reason in 1 sentence",
  "isAlert": false,
  "stateLocation": "General"
}
stateLocation must be a valid Malaysian state or "General".
Article:
${text}`;

  try {
    let parsed = null;
    const attempts = isOllamaCloud() ? 2 : 1;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const raw = await performAiRequest(
        prompt,
        process.env.QWEN_MODEL || 'gpt-4o-mini',
        0.1,
        300,
        isOllamaCloud() ? { format: 'json' } : {}
      );
      const jsonString = extractJsonObject(raw);
      if (!jsonString) {
        console.warn('Raw AI Response (No JSON):', raw);
        continue;
      }
      try {
        parsed = JSON.parse(jsonString);
        break;
      } catch (parseErr) {
        console.warn(`AI sentiment JSON parse failed on attempt ${attempt + 1}: ${parseErr.message}`);
      }
    }

    if (!parsed) {
      throw new Error('No valid JSON object found in AI response');
    }

    const valid = ['Positive', 'Negative', 'Neutral'];
    const result = parsed;
    if (!valid.includes(result.sentiment)) result.sentiment = 'Neutral';
    result.confidence = Number.isFinite(Number(result.confidence))
      ? Math.max(0, Math.min(1, Number(result.confidence)))
      : 0.5;
    result.analysis_source = isOllamaCloud() ? 'ollama' : 'ai';
    if (!result.stateLocation) result.stateLocation = 'General';
    if (typeof result.isAlert !== 'boolean') result.isAlert = false;
    return result;
  } catch (err) {
    console.warn(`AI sentiment failed, using local fallback: ${err.message}`);
    return localSentiment(title, description);
  }
};

/**
 * Generate a concise 2-3 sentence summary/digest for a batch of articles
 */
const generateDigest = async (articles, topic) => {
  const articleSummary = articles
    .slice(0, 15)
    .map((a, i) => {
      const title = a.title || a.description?.substring(0, 50) || 'Untitled Article';
      const sentiment = a.sentiment || 'Neutral';
      return `${i + 1}. [${sentiment}] ${title}`;
    })
    .join('\n');

  console.log(`[Digest] Generating for ${articles.length} articles about "${topic}"`);

  const prompt = `[STRICT BILINGUAL JSON MODE]
You are a high-level Malaysian news intelligence analyst.
Summarize the recent news about "${topic || 'General News'}":

${articleSummary}

Task: Provide a structured digest that is extremely clear and professional.
1. Start with an 'Executive overview:' header followed by 1-2 sentences. 
2. Use a 'Key news themes' header.
3. List news themes starting with a bullet character '•' instead of dashes.

CRITICAL: DO NOT use asterisks (*) for bolding. DO NOT use dashes (-) for bullets. 
Maintain a very clean, text-only professional format with clear spacing.
Output MUST be a single JSON object containing translations for both English (en) and Bahasa Melayu (ms):
{
  "en": "Executive overview: ...\\n\\nKey news themes:\\n• ...",
  "ms": "Ringkasan eksekutif: ...\\n\\nTema utama berita:\\n• ..."
}
NO other text outside the JSON.`;

  try {
    const model = process.env.QWEN_MODEL || 'gpt-oss:120b';
    const raw = await performAiRequest(prompt, model, 0.4, 1200);
    const jsonString = extractJsonObject(raw);
    if (!jsonString) {
      console.warn('Raw AI Response (No JSON):', raw);
      throw new Error('No JSON object found in AI response');
    }
    const parsed = JSON.parse(jsonString);
    return { digest: parsed };
  } catch (err) {
    console.error('Digest generation failed:', err.message);
    throw err;
  }
};

/**
 * 7-day forecast
 */
const generateForecast = async (articles, topic) => {
  const summary = articles.slice(0, 15).map((a) => `- ${a.title}`).join('\n');
  const prompt = `[STRICT BILINGUAL JSON MODE]
Based on these Malaysia news:
${summary}

Task: Forecast sentiment for the next 7 days about "${topic}".
Output must be a SINGLE JSON object containing translations for both English (en) and Bahasa Melayu (ms).
Use specific field names for frontend compatibility.

Expected JSON:
{
  "projectionScore": 65,
  "en": {
    "outlook": ["Strategic point 1...", "Strategic point 2..."],
    "risks": ["Risk/Trend A", "Risk/Trend B"]
  },
  "ms": {
    "outlook": ["Poin strategik 1...", "Poin strategik 2..."],
    "risks": ["Risiko/Trend A", "Risiko/Trend B"]
  }
}
Generate professional, deep analytical content for both. NO other text. Just the JSON.`;

  try {
    const raw = await performAiRequest(prompt, process.env.QWEN_MODEL || 'gpt-oss:120b', 0.6, 2000);
    const jsonString = extractJsonObject(raw);
    if (!jsonString) {
      console.warn('Raw AI Response (No JSON):', raw);
      throw new Error('No JSON object found in AI response');
    }
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Forecast generation failed:', err.message);
    if (err.response) console.error('API Error Details:', err.response.data);
    return {
      projectionScore: 50,
      en: {
        outlook: ['Unable to generate outlook at this time.'],
        risks: ['Data temporarily unavailable'],
      },
      ms: {
        outlook: ['Gagal menjana maklumat buat masa ini.'],
        risks: ['Data tidak tersedia'],
      },
    };
  }
};

/**
 * Detailed analysis for the slide-in panel: summary, entities, and sentiment breakdown.
 */
const analyzeDetailedArticle = async (article) => {
  const text = `Title: ${article.title}\nDescription: ${article.description || 'No description available'}`;

  const prompt = `[ANALYTICAL DEEP-DIVE MODE]
You are a senior Malaysian media analyst. Analyze this news article:
${text}

SENTIMENT GUIDELINES (MALAYSIAN CONTEXT):
- NEGATIVE: Tragedies, accidents (maut/kemalangan), corruption (rasuah), price hikes, or unaddressed grievances.
- POSITIVE: Economic progress, success, celebrations, AND critical investigations/probes (siasatan/tindakan) that show government accountability or responsiveness to public issues.
- NEUTRAL: Factual reporting on routine events without strong emotional or active framing.

Task: Provide a 3-sentence summary, extract key entities, and give a sentiment breakdown (Negative/Neutral/Positive scores adding up to 100).

Output MUST be a single JSON object:
{
  "summary": "3 sentences exactly.",
  "entities": {
    "people": [],
    "organizations": [],
    "locations": [],
    "topics": []
  },
  "sentimentBreakdown": {
    "negative": 0-100,
    "neutral": 0-100,
    "positive": 0-100,
    "reasoning": "Explain the score. Note: If a tragedy is being investigated, factor in the 'Investigation' as a positive/accountability indicator."
  }
}
Identify entities correctly. No other text.`;

  try {
    const raw = await performAiRequest(prompt, process.env.QWEN_MODEL || 'gpt-oss:120b', 0.4, 1500);
    const jsonString = extractJsonObject(raw);
    if (!jsonString) throw new Error('No JSON object found in AI response');
    const result = JSON.parse(jsonString);

    const sb = result.sentimentBreakdown;
    let dominant = 'Neutral';
    if (sb.positive > sb.neutral && sb.positive > sb.negative) dominant = 'Positive';
    else if (sb.negative > sb.neutral && sb.negative > sb.positive) dominant = 'Negative';

    return {
      ...result,
      sentiment: dominant,
      reason: result.sentimentBreakdown.reasoning,
      title: article.title,
      url: article.url,
      source: article.source,
      publishedAt: article.publishedAt,
    };
  } catch (err) {
    console.error('Detailed analysis failed:', err.message);
    return {
      summary: article.description?.substring(0, 150) + '...',
      entities: { people: [], organizations: [], locations: [], topics: [] },
      sentimentBreakdown: { negative: 33, neutral: 34, positive: 33, reasoning: 'Detailed AI analysis unavailable.' },
      title: article.title,
      url: article.url,
      source: article.source,
      publishedAt: article.publishedAt,
    };
  }
};

/**
 * Backward-compatible entry point for the main ingestion flow.
 * The news controller expects the lightweight sentiment payload shape.
 */
const analyseArticle = async (title, description) => analyzeSentiment(title, description);

/**
 * Extract topics from article text
 */
const getAiTopics = async (text) => {
  const prompt = `Identify 3-5 main news topics or entities from this text. Respond ONLY as a comma-separated list.\n\nText: ${text}`;
  try {
    const response = await performAiRequest(prompt, process.env.QWEN_MODEL || 'gpt-3.5-turbo', 0.1, 50);
    return response.split(',').map((t) => t.trim());
  } catch (err) {
    return [];
  }
};

module.exports = {
  analyzeSentiment,
  generateForecast,
  generateDigest,
  analyzeDetailedArticle,
  analyseArticle,
  getAiTopics,
  getClient,
  performAiRequest,
};
