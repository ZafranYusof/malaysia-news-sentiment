const OpenAI = require('openai');
const Sentiment = require('sentiment');

// Local fallback analyser (keyword-based, no API needed)
const localAnalyser = new Sentiment();

// Lazy-init OpenAI
let openai = null;
const getClient = () => {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
};

/**
 * Local keyword-based fallback (instant, free)
 * Maps score → Positive / Negative / Neutral
 */
const localSentiment = (title, description) => {
  const text = `${title} ${description || ''}`.toLowerCase();
  const result = localAnalyser.analyze(text);
  let score = result.score;

  // -- Add Malay Sentiment Dictionary (#Bilingual Support) --
  const MALAY_POS = [
    'bagus', 'baik', 'bangga', 'menang', 'berjaya', 'syukur', 'ceria', 'untung', 'maju', 
    'pulih', 'lancar', 'hebat', 'senang', 'selamat', 'bantu', 'hadiah', 'bonus', 'setuju',
    'gemilang', 'syabas', 'tahniah', 'naik', 'positif', 'aman', 'sejahtera', 'kukuh', 'mantap', 'bijak', 'adil'
  ];
  const MALAY_NEG = [
    'buruk', 'gagal', 'mati', 'kematian', 'banjir', 'kemelut', 'krisis', 'masalah', 'rugi', 
    'sedih', 'takut', 'bahaya', 'sakit', 'gaduh', 'marah', 'rosak', 'hancur', 'rasuah', 
    'salah', 'jenayah', 'rompak', 'bunuh', 'protes', 'demo', 'bantah', 'kecewa',
    'jatuh', 'lemah', 'kecam', 'hina', 'fitnah', 'zalim', 'parah', 'tenat', 'susah', 'miskin', 'derita'
  ];
  
  MALAY_POS.forEach(w => { if (text.includes(w)) score += 2; });
  MALAY_NEG.forEach(w => { if (text.includes(w)) score -= 2; });

  let sentiment = 'Neutral';
  if (score >= 2)       sentiment = 'Positive';
  else if (score <= -2) sentiment = 'Negative';
  
  const confidence = Math.min(Math.abs(score) / 10, 0.85);

  const isAlert = result.negative.some(w => ['crisis', 'flood', 'disaster', 'emergency', 'attack', 'dead'].includes(w)) ||
                  ['banjir', 'krisis', 'kecemasan', 'bahaya', 'mati', 'perang', 'gaduh', 'protes'].some(w => text.includes(w));
  
  // Basic state extraction for local
  const MALAYSIAN_STATES = ['johor', 'kedah', 'kelantan', 'melaka', 'negeri sembilan', 'pahang', 'perak', 'perlis', 'pulau pinang', 'sabah', 'sarawak', 'selangor', 'terengganu', 'kuala lumpur', 'putrajaya', 'labuan'];
  const stateFound = MALAYSIAN_STATES.find(s => text.includes(s)) || 'General';

  const processedState = stateFound.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    sentiment,
    confidence: parseFloat(confidence.toFixed(2)),
    reason: `Bilingual keyword analysis: Found ${score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'} indicators in text.`,
    source: 'local',
    isAlert,
    stateLocation: processedState === 'General' ? 'General' : processedState
  };
};

/**
 * GPT-based sentiment analysis — bilingual EN + BM
 * Only classifies as Neutral when truly factual/ambiguous.
 */
const analyzeSentiment = async (title, description) => {
  const text = `Title: ${title}\nDescription: ${description || 'No description available'}`;

  // Fast-fail if no key
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_')) {
    return localSentiment(title, description);
  }

  const prompt = `You are a specialized Malaysian news sentiment analyst. You understand the deep socio-political nuances of both English and Bahasa Malaysia (Malay).

TASK: Classify the sentiment of the following Malaysian news as Positive, Negative, or Neutral.

BM SENSITIVITY GUIDELINES:
- News about "Banjir", "Kemalangan", "Rasuah", "Kenaikan Harga", "Jenayah", "Saman", or "Protes" are ALWAYS "Negative".
- News about "Kejayaan", "Pembangunan", "Bantuan", "Pemulihan Ekonomi", "Tahniah", or "Perayaan" are ALWAYS "Positive".
- Socio-political issues in Malaysia often have implied sentiments; avoid defaulting to "Neutral" unless the news is purely about a scheduled calendar event with no human impact.
- Classify "Neutral" ONLY if the text is 100% objective data or a standard announcement (e.g., "Hari ini Selasa", "Pejabat tutup pukul 5").

GENERAL RULES:
- "Positive": Progress, recovery, celebrations, growth, stability, awards.
- "Negative": Conflicts, crises, crimes, economic hardship, social issues, complaints.
- "Neutral": ONLY for static announcements/facts with NO emotional impact.

Article:
${text}

Respond ONLY in this exact JSON format:
{
  "sentiment": "Positive" | "Negative" | "Neutral",
  "confidence": 0.0 to 1.0,
  "reason": "Explain the sentiment triggers based on Malaysian context. 1-2 sentences.",
  "isAlert": true | false,
  "stateLocation": "StateName"
} (StateName must be a valid Malaysian state or 'General')`;

  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,   // Slightly higher to allow nuance
      max_tokens: 150,
    });

    const raw = completion.choices[0].message.content.trim();
    // Safety check for markdown
    const cleanJson = raw.replace(/^```json\n|```$/g, '');
    const result = JSON.parse(cleanJson);

    const valid = ['Positive', 'Negative', 'Neutral'];
    if (!valid.includes(result.sentiment)) result.sentiment = 'Neutral';

    // Metadata (#1)
    result.source = 'openai';
    if (!result.stateLocation) result.stateLocation = 'General';
    if (result.isAlert === undefined) result.isAlert = false;

    return result;
  } catch (err) {
    console.warn(`⚠️  OpenAI sentiment failed, using local fallback: ${err.message}`);
    return localSentiment(title, description);
  }
};

/**
 * Generate a 7-day forecast based on recent news data
 */
const generateForecast = async (articles, topic) => {
  const openai = getClient();
  if (!openai || !articles || articles.length === 0) {
    return { outlook: 'No data available for forecasting.', risks: [], projectionScore: 50 };
  }

  try {
    const summary = articles.slice(0, 30)
      .map(a => `- [${a.sentiment}] ${a.title}`)
      .join('\n');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a Malaysian political and economic analyst. Forecast sentiment trends based on news headlines.' 
        },
        { 
          role: 'user', 
          content: `Based on these recent headlines regarding "${topic || 'General'}", provide a 7-day outlook.
          Include: outlook (3 sentences), 3 specific "risks", and a projectionScore (0-100).
          
          Format as JSON: { "outlook": "...", "risks": ["risk1", "risk2", "risk3"], "projectionScore": 85 }
          
          Headlines:
          ${summary}` 
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Forecast AI Error:', error.message);
    return { outlook: 'Unable to generate forecast.', risks: [], projectionScore: 50 };
  }
};

module.exports = { analyzeSentiment, getClient, generateForecast };
