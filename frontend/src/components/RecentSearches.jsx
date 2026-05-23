import React, { useState, useEffect } from 'react';

const RecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState([]);
  const suggestedTopics = ['Politik', 'Ekonomi', 'Pendidikan', 'Kesihatan', 'Teknologi'];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(saved.slice(0, 5));
  }, []);

  return (
    <div className="recent-searches">
      {recentSearches.length > 0 && (
        <div className="recent-searches__history">
          <h4>Recent Searches</h4>
          <div className="recent-searches__tags">
            {recentSearches.map((query, i) => (
              <span key={i} className="search-tag">{query}</span>
            ))}
          </div>
        </div>
      )}
      <div className="recent-searches__suggested">
        <h4>Trending Topics</h4>
        <div className="recent-searches__tags">
          {suggestedTopics.map((topic, i) => (
            <span key={i} className="search-tag search-tag--suggested">{topic}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentSearches;
