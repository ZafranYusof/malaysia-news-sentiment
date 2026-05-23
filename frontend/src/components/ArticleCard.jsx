import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const SENTIMENT_COLORS = {
  positive: '#4CAF50',
  negative: '#f44336',
  neutral: '#9E9E9E',
};

const ArticleCard = ({ article }) => {
  const borderColor = SENTIMENT_COLORS[article.sentiment] || '#9E9E9E';
  const relativeTime = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });

  return (
    <div className="article-card" style={{ borderLeft: `4px solid ${borderColor}` }}>
      <div className="article-card__header">
        <img
          className="article-card__favicon"
          src={`https://www.google.com/s2/favicons?domain=${article.sourceUrl}&sz=32`}
          alt={article.source}
        />
        <span className="article-card__source">{article.source}</span>
        <span className="article-card__time">{relativeTime}</span>
      </div>
      <h4 className="article-card__title">
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </h4>
      <p className="article-card__desc">{article.description?.slice(0, 120)}...</p>
      <div className="article-card__footer">
        <span className={`sentiment-badge sentiment-badge--${article.sentiment}`}>
          {article.sentiment}
        </span>
        <span className="article-card__confidence">
          {(article.confidence * 100).toFixed(0)}% confidence
        </span>
      </div>
    </div>
  );
};

export default ArticleCard;
