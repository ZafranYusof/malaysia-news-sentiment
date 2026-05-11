.

---

## Quick Start

### Step 1: Clone & Setup API Keys

Copy the environment template and fill in your API keys:

```bash
cd backend
copy .env.example .env
```

Open `.env` and fill in:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/malaysia_news_sentiment
NEWS_API_KEY=your_newsapi_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 2: Get Your Free API Keys
- **NewsAPI** (free): https://newsapi.org — sign up and copy your API key
- **OpenAI**: https://platform.openai.com/api-keys — requires a paid account (very cheap, ~$0.001/article)
- **MongoDB**: Install locally or use MongoDB Atlas (free tier)

### Step 3: Start the Backend

```bash
cd backend
npm run dev
```

Server runs at `http://localhost:5000`

### Step 4: Start the Frontend

```bash
cd frontend
npm run dev
```

App opens at `http://localhost:5173`

---

## Project Structure

```
malaysia-news-sentiment/
├── backend/
│   ├── config/db.js          ← MongoDB connection
│   ├── controllers/          ← Route handler logic
│   ├── models/Article.js     ← Mongoose schema
│   ├── routes/               ← Express route definitions
│   ├── services/
│   │   ├── newsService.js    ← NewsAPI integration 
│   │   └── openaiService.js  ← OpenAI GPT integration 
│   └── server.js             ← Express app entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── SearchBar.jsx         ← Search input + topic pills
        │   ├── ArticleCard.jsx       ← News article display card
        │   ├── SentimentBadge.jsx    ← Coloured sentiment pill
        │   ├── SentimentPieChart.jsx ← Recharts donut chart
        │   ├── SentimentBarChart.jsx ← Recharts bar chart
        │   └── TrendLineChart.jsx    ← Recharts line chart
        ├── pages/
        │   ├── Dashboard.jsx         ← Main dashboard page 
        │   └── History.jsx           ← Article history page
        ├── services/api.js           ← Axios API calls
        └── App.jsx                   ← Router + Navbar
```

---

## API Endpoints

| Method | URL                    | Description                        |
|--------|------------------------|------------------------------------|
| GET    | `/api/news?q=Malaysia` | Fetch & analyze news (main action) |
| GET    | `/api/history`         | View all stored articles           |
| GET    | `/api/history/trends`  | Trend data for line chart          |
| DELETE | `/api/history/:id`     | Delete an article                  |

---

## Libraries Used

| Library      | Purpose                              |
|--------------|--------------------------------------|
| Express      | Backend REST API framework           |
| Mongoose     | MongoDB object modeling              |
| Axios        | HTTP client (both frontend/backend)  |
| OpenAI SDK   | GPT-4o-mini sentiment analysis       |
| React        | UI framework                         |
| Vite         | Fast frontend build tool             |
| Recharts     | Charts (Pie, Bar, Line)              |
| React Router | Page navigation                      |

---

## Features

- **Search** any Malaysian news topic
- **AI Sentiment Classification** (Positive / Negative / Neutral) via GPT-4o-mini
- **Pie & Bar Charts** for sentiment distribution
- **Trend Line Chart** showing sentiment over time
- **MongoDB Storage** — no duplicate analyses (saves API costs)
- **History Page** — view and delete past analyses
- **Dark Mode UI** — premium glassmorphism design

---

##  FYP Notes

- The system uses **GPT-4o-mini** — the cheapest OpenAI model (~$0.15/million tokens)
- NewsAPI free plan allows **500 requests/day**
- Articles are **cached in MongoDB** to avoid re-analyzing the same article
- The confidence score (0.0–1.0) shows how certain the AI is about its classification

---

