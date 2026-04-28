import React, { useState, useEffect } from 'react';

const FUN_FACTS = [
  "💡 Did you know? Sentiment analysis can detect sarcasm with 65% accuracy",
  "📊 The average news article contains 3-5 key entities",
  "🇲🇾 Malaysian news covers 14 states and 3 federal territories",
  "🤖 AI can analyze sentiment in Bahasa Melayu and English",
  "📰 Over 50,000 news articles are published daily in Malaysia",
  "🧠 NLP models can understand context, not just keywords",
  "📈 Positive news tends to get 40% more engagement",
  "🔍 Sentiment trends help predict market movements",
  "💬 Social media sentiment differs from news sentiment by ~20%",
  "⚡ Our AI processes each article in under 2 seconds",
];

const AnalyzingOverlay = ({ progress }) => {
  const [factIndex, setFactIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setFactIndex(prev => (prev + 1) % FUN_FACTS.length);
        setFadeIn(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!progress || progress.total === 0) return null;

  const pct = Math.round((progress.done / progress.total) * 100);

  return (
    <div className="analyzing-overlay">
      <div className="analyzing-card">
        <div className="analyzing-icon">
          <div className="analyzing-spinner" />
        </div>
        <h3 className="analyzing-title">Analyzing Articles</h3>
        <p className="analyzing-count">{progress.done} of {progress.total} completed</p>
        
        <div className="analyzing-progress-track">
          <div 
            className="analyzing-progress-fill" 
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="analyzing-pct">{pct}%</span>

        <div className={`analyzing-fact ${fadeIn ? 'fact-visible' : 'fact-hidden'}`}>
          {FUN_FACTS[factIndex]}
        </div>
      </div>
    </div>
  );
};

export default AnalyzingOverlay;
