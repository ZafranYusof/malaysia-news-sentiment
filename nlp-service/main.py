import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Model (lazy load on startup) ──────────────────────────────────
# Uses 'mesolitica/sentiment-analysis-nanot5-tiny-malaysian-cased'
# — a Malaya-published BM sentiment model on HuggingFace, Python 3.14 compatible
nlp_model = None

def load_model():
    global nlp_model
    try:
        import malaya
        nlp_model = malaya.sentiment.huggingface()
        logger.info("✅ Malaya BM sentiment model loaded successfully.")
    except Exception as e:
        logger.warning(f"⚠️  Malaya failed to load: {e}. Falling back to rule-based.")
        nlp_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield

app = FastAPI(title="MY News NLP Microservice — Malaya BM Sentiment", lifespan=lifespan)

# ── Schemas ───────────────────────────────────────────────────────
class SentimentInput(BaseModel):
    text: str
    language: Optional[str] = "auto"

class SentimentResponse(BaseModel):
    sentiment: str        # Positive | Negative | Neutral
    confidence: float
    method: str           # "malaya-hf" | "rule-based"
    language: str

# ── Language Detection ────────────────────────────────────────────
MALAY_MARKERS = [
    'yang','dan','di','dengan','untuk','ini','itu','adalah','kepada',
    'tidak','boleh','akan','telah','oleh','dalam','bagi','pada',
    'kerajaan','rakyat','negara','bahawa','menteri','perdana','kami','kita',
    'banjir','berjaya','isu','awam','negeri','selangor','johor','sabah',
    'sarawak','melaka','perak','pahang','terengganu','kelantan','putrajaya',
    'polis','warga','jenayah','ekonomi','harga','rm','ringgit','mahkamah',
    'parlimen','pilihan','raya','datuk','tan','sri',
    'bandar','luar','kawasan','projek','pembangunan'
]

def detect_language(text: str) -> str:
    words = text.lower().split()
    hits = sum(1 for w in words if w in MALAY_MARKERS)
    # Lower threshold for short texts (e.g. headlines)
    threshold = 1 if len(words) <= 6 else 2
    return "ms" if hits >= threshold else "en"

# ── Rule-based Fallback ───────────────────────────────────────────
RULE_POS = ['bagus','baik','bangga','menang','berjaya','syukur','maju','pulih',
            'lancar','hebat','selamat','bantu','hadiah','bonus','setuju',
            'good','great','success','win','safe','help','positive','improve','growth']
RULE_NEG = ['buruk','gagal','mati','banjir','krisis','masalah','rugi','sedih',
            'takut','bahaya','sakit','rosak','hancur','rasuah','jenayah','bunuh',
            'bad','fail','death','flood','crisis','danger','corrupt','attack','loss']

def rule_based_sentiment(text: str, lang: str) -> SentimentResponse:
    words = set(text.lower().split())
    pos = sum(1 for w in RULE_POS if w in words)
    neg = sum(1 for w in RULE_NEG if w in words)
    score = pos - neg
    sentiment = "Positive" if score > 0 else ("Negative" if score < 0 else "Neutral")
    confidence = round(min(abs(score) / max(pos + neg, 1), 0.85), 2) if (pos + neg) > 0 else 0.5
    return SentimentResponse(sentiment=sentiment, confidence=confidence, method="rule-based", language=lang)

# ── Label mapping (HuggingFace model outputs) ─────────────────────
LABEL_MAP = {
    "positive": "Positive",
    "negative": "Negative",
    "neutral":  "Neutral",
    "POSITIVE": "Positive",
    "NEGATIVE": "Negative",
    "NEUTRAL":  "Neutral",
    "LABEL_0":  "Negative",
    "LABEL_1":  "Neutral",
    "LABEL_2":  "Positive",
}

# ── Endpoints ─────────────────────────────────────────────────────
@app.get("/")
def health():
    return {
        "status": "healthy",
        "service": "nlp-microservice-malaya-bm",
        "model_loaded": nlp_model is not None
    }

@app.post("/sentiment", response_model=SentimentResponse)
def analyze_sentiment(data: SentimentInput):
    text = data.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    lang = data.language if data.language != "auto" else detect_language(text)

    # ── Try HuggingFace Malaya model ─────────────────────────────
    if nlp_model is not None:
        try:
            results = nlp_model.predict_proba([text[:512]])[0]
            # results = {'negative': 0.03, 'neutral': 0.05, 'positive': 0.92}
            label = max(results, key=results.get)
            mapped = LABEL_MAP.get(label, "Neutral")
            return SentimentResponse(
                sentiment=mapped,
                confidence=round(results[label], 2),
                method="malaya",
                language=lang
            )
        except Exception as e:
            logger.warning(f"Inference failed: {e}. Using rule-based.")

    return rule_based_sentiment(text, lang)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
