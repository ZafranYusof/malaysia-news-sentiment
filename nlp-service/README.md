# NLP Microservice (Python)

This service provides Bahasa Malaysia-aware sentiment analysis for the Malaysia News Sentiment dashboard.

## Setup

1. **Prerequisites**:
   - Python 3.9+
   - Recommended: Virtual Environment (`python -m venv venv`)

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Service**:
   ```bash
   python main.py
   ```

The service will start on `http://localhost:8001`.

## API Endpoints

| Method | URL          | Description                          |
|--------|--------------|--------------------------------------|
| GET    | `/`          | Health check (model status)          |
| POST   | `/sentiment` | Analyze sentiment of a text snippet  |

### POST /sentiment

**Request body:**
```json
{ "text": "Kerajaan umum bantuan RM500", "language": "auto" }
```

**Response:**
```json
{ "sentiment": "Positive", "confidence": 0.92, "method": "malaya", "language": "ms" }
```

## Features

- **Sentiment Analysis**: Uses the `Malaya` library for localized BM sentiment detection.
- **Rule-based Fallback**: If the Malaya model fails to load, a keyword-based analyser handles requests with curated Malay and English word lists.
- **Auto Language Detection**: Detects Bahasa Malaysia vs English from the input text.
