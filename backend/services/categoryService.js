/**
 * Category Service — keyword-based article categorization
 * Fast, no AI needed. Maps articles to predefined categories.
 */

const CATEGORY_KEYWORDS = {
  Politics: [
    'kerajaan', 'parlimen', 'menteri', 'election', 'pilihan raya', 'umno', 'pas',
    'ph', 'pn', 'bn', 'dap', 'pkr', 'bersatu', 'politik', 'political', 'government',
    'opposition', 'pembangkang', 'cabinet', 'kabinet', 'prime minister', 'perdana menteri',
    'anwar', 'mahathir', 'agong', 'sultan', 'democracy', 'demokrasi', 'vote', 'undi',
    'manifesto', 'coalition', 'gabungan', 'parliament', 'dewan rakyat', 'senator'
  ],
  Economy: [
    'ekonomi', 'economy', 'gdp', 'ringgit', 'bank', 'inflation', 'inflasi',
    'stock', 'saham', 'bursa', 'trade', 'perdagangan', 'export', 'import',
    'business', 'perniagaan', 'investment', 'pelaburan', 'tax', 'cukai',
    'budget', 'bajet', 'revenue', 'profit', 'market', 'pasaran', 'epf', 'kwsp',
    'bnm', 'bank negara', 'interest rate', 'kadar faedah', 'subsidy', 'subsidi',
    'gst', 'sst', 'unemployment', 'pengangguran', 'startup', 'fintech'
  ],
  Sports: [
    'sukan', 'sports', 'football', 'bola sepak', 'badminton', 'olympics',
    'athlete', 'atlet', 'liga', 'league', 'tournament', 'kejohanan',
    'medal', 'pingat', 'fifa', 'sea games', 'harimau malaya', 'fam',
    'hockey', 'swimming', 'renang', 'cycling', 'basikal', 'cricket',
    'squash', 'tennis', 'golf', 'motorsport', 'sepak takraw'
  ],
  Crime: [
    'jenayah', 'crime', 'polis', 'police', 'murder', 'bunuh', 'robbery',
    'rompakan', 'fraud', 'penipuan', 'arrest', 'tangkap', 'court', 'mahkamah',
    'jail', 'penjara', 'drug', 'dadah', 'corruption', 'rasuah', 'macc', 'sprm',
    'scam', 'theft', 'curi', 'assault', 'kidnap', 'culik', 'suspect', 'suspek',
    'investigation', 'siasatan', 'convicted', 'sentence', 'hukuman'
  ],
  Technology: [
    'teknologi', 'technology', 'ai', 'artificial intelligence', 'digital',
    'startup', 'app', 'aplikasi', 'software', 'internet', 'cyber', 'siber',
    'data', '5g', 'cloud', 'blockchain', 'crypto', 'semiconductor', 'chip',
    'robot', 'automation', 'mdec', 'tech', 'innovation', 'inovasi',
    'smartphone', 'laptop', 'gadget', 'programming', 'coding'
  ],
  Entertainment: [
    'hiburan', 'entertainment', 'movie', 'filem', 'music', 'muzik', 'concert',
    'konsert', 'celebrity', 'selebriti', 'drama', 'tv', 'netflix', 'viral',
    'social media', 'media sosial', 'influencer', 'tiktok', 'youtube',
    'singer', 'penyanyi', 'actor', 'pelakon', 'award', 'anugerah',
    'festival', 'show', 'rancangan', 'podcast', 'streaming'
  ],
  Health: [
    'kesihatan', 'health', 'hospital', 'doctor', 'doktor', 'covid',
    'vaccine', 'vaksin', 'disease', 'penyakit', 'medical', 'perubatan',
    'clinic', 'klinik', 'mental health', 'kesihatan mental', 'dengue',
    'cancer', 'kanser', 'diabetes', 'surgery', 'pembedahan', 'pharmacy',
    'farmasi', 'who', 'pandemic', 'pandemik', 'outbreak', 'wabak', 'moh'
  ],
  Education: [
    'pendidikan', 'education', 'university', 'universiti', 'school', 'sekolah',
    'student', 'pelajar', 'teacher', 'guru', 'exam', 'peperiksaan', 'spm',
    'stpm', 'upsr', 'scholarship', 'biasiswa', 'moe', 'kpm', 'research',
    'penyelidikan', 'degree', 'ijazah', 'college', 'kolej', 'ptptn',
    'academic', 'akademik', 'curriculum', 'kurikulum', 'literacy'
  ],
  Environment: [
    'alam sekitar', 'environment', 'climate', 'iklim', 'flood', 'banjir',
    'pollution', 'pencemaran', 'deforestation', 'penebangan', 'wildlife',
    'hidupan liar', 'green', 'hijau', 'carbon', 'karbon', 'renewable',
    'solar', 'recycle', 'kitar semula', 'haze', 'jerebu', 'earthquake',
    'gempa', 'tsunami', 'drought', 'kemarau', 'conservation', 'pemuliharaan'
  ],
  International: [
    'international', 'antarabangsa', 'foreign', 'luar negara', 'united nations',
    'un', 'asean', 'china', 'usa', 'america', 'europe', 'eropah', 'japan',
    'jepun', 'india', 'australia', 'singapore', 'singapura', 'indonesia',
    'thailand', 'middle east', 'timur tengah', 'war', 'perang', 'diplomat',
    'embassy', 'kedutaan', 'global', 'world', 'dunia', 'nato', 'g20'
  ]
};

/**
 * Categorize an article based on title + content keywords
 * Returns array of matching categories (can be multiple)
 */
function categorizeArticle(title, content) {
  const text = `${title || ''} ${content || ''}`.toLowerCase();
  const matched = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        score++;
      }
    }
    // Need at least 2 keyword matches to assign category
    if (score >= 2) {
      matched.push({ category, score });
    }
  }

  // Sort by score descending, return top 3 categories max
  matched.sort((a, b) => b.score - a.score);
  const categories = matched.slice(0, 3).map(m => m.category);

  // If no match, assign "General"
  return categories.length > 0 ? categories : ['General'];
}

/**
 * Get all available categories
 */
function getAllCategories() {
  return [...Object.keys(CATEGORY_KEYWORDS), 'General'];
}

module.exports = { categorizeArticle, getAllCategories, CATEGORY_KEYWORDS };
