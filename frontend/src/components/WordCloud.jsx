import React, { useEffect, useState } from 'react';
import { getKeywords } from '../services/api';

const WordCloud = ({ words: propWords }) => {
  const [internalWords, setInternalWords] = useState([]);
  const [loading, setLoading] = useState(!propWords);
  const [error, setError] = useState(null);

  const displayWords = (propWords && propWords.length > 0) ? propWords : internalWords;

  useEffect(() => {
    // Only fetch internally if NO props are provided
    if (propWords && propWords.length > 0) {
      setLoading(false);
      return;
    }

    const fetchWords = async () => {
      setLoading(true);
      try {
        const data = await getKeywords();
        setInternalWords(data);
      } catch (err) {
        console.error('Error fetching keywords:', err);
        setError('Unable to load trending keywords.');
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [propWords]);

  if (loading) return (
    <div className="wordcloud-skeleton">
      {[...Array(20)].map((_, i) => (
        <span key={i} className="skeleton-pill" style={{ width: `${Math.random() * 60 + 40}px` }} />
      ))}
    </div>
  );

  if (error || displayWords.length === 0) return null;

  // Max and min counts for scaling font sizes
  const counts = displayWords.map(w => w.count);
  const max = Math.max(...counts);
  const min = Math.min(...counts);

  const getFontSize = (count) => {
    if (max === min) return '14px';
    const scale = (count - min) / (max - min);
    // Returns fontsize between 12px and 28px
    return `${Math.round(12 + scale * 16)}px`;
  };

  const getWeight = (count) => {
    if (max === min) return '400';
    const scale = (count - min) / (max - min);
    if (scale > 0.8) return '700';
    if (scale > 0.5) return '600';
    if (scale > 0.2) return '500';
    return '400';
  };

  const getOpacity = (count) => {
    if (max === min) return '0.8';
    const scale = (count - min) / (max - min);
    return (0.5 + scale * 0.5).toFixed(2);
  };

  return (
    <div className="wordcloud-container">
      <div className="wordcloud-header">
        <h3 className="section-title-sm">Trending Keywords</h3>
        <span className="section-subtitle-xs">Based on latest news data</span>
      </div>
      <div className="wordcloud-tags">
        {displayWords.map((item, idx) => (
          <span
            key={idx}
            className="wordcloud-tag"
            style={{
              fontSize: getFontSize(item.count),
              fontWeight: getWeight(item.count),
              opacity: getOpacity(item.count),
              animationDelay: `${idx * 0.05}s`
            }}
            title={`${item.count} mentions`}
          >
            {item.word}
          </span>
        ))}
      </div>
    </div>
  );
};

export default WordCloud;
