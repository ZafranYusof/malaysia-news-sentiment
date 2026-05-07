import React from 'react';

const SENTIMENT_META = {
  Positive: { icon: '↑', label: 'Positive' },
  Negative: { icon: '↓', label: 'Negative' },
  Neutral:  { icon: '→', label: 'Neutral'  },
};

const SentimentBadge = ({ sentiment }) => {
  const meta = SENTIMENT_META[sentiment] || SENTIMENT_META.Neutral;
  return (
    <span className={`s-badge s-badge--${sentiment}`}>
      <span style={{ fontSize: '13px', lineHeight: 1 }}>{meta.icon}</span>
      {meta.label}
    </span>
  );
};

export default React.memo(SentimentBadge);
