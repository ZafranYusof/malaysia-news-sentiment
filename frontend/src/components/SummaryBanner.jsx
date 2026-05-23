import React from 'react';

const SummaryBanner = ({ stats }) => {
  const dominant = stats.positivePercent >= stats.negativePercent ? 'positive' : 'negative';

  return (
    <div className={`summary-banner summary-banner--${dominant}`}>
      <p>
        Current sentiment landscape: <strong>{stats.positive}</strong> positive,{' '}
        <strong>{stats.negative}</strong> negative, <strong>{stats.neutral}</strong> neutral
        articles in the last 24 hours.
        {dominant === 'positive'
          ? ' Overall sentiment is leaning positive.'
          : ' Overall sentiment is leaning negative.'}
      </p>
    </div>
  );
};

export default SummaryBanner;
