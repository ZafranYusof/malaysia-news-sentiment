import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchAndAnalyzeNews } from '../services/api';
import SentimentPieChart from '../components/SentimentPieChart';
import SentimentBarChart from '../components/SentimentBarChart';
import toast from 'react-hot-toast';

const ComparePage = () => {
  const { t } = useLanguage();
  const [topicA, setTopicA] = useState('Ringgit');
  const [topicB, setTopicB] = useState('US Dollar');
  const [dataA, setDataA]   = useState(null);
  const [dataB, setDataB]   = useState(null);
  const [loading, setLoading] = useState(false);

  const calcDistribution = (arts) => ({
    Positive: arts.filter(a => a.sentiment === 'Positive').length,
    Negative: arts.filter(a => a.sentiment === 'Negative').length,
    Neutral:  arts.filter(a => a.sentiment === 'Neutral').length,
  });

  const handleCompare = async () => {
    if (!topicA.trim() || !topicB.trim()) {
      toast.error('Please enter two topics to compare');
      return;
    }

    setLoading(true);
    const compareToast = toast.loading('Comparing topics...');
    
    try {
      const [resA, resB] = await Promise.all([
        fetchAndAnalyzeNews(topicA.trim(), 15),
        fetchAndAnalyzeNews(topicB.trim(), 15)
      ]);

      setDataA({
        articles: resA.articles,
        dist: resA.sentimentDistribution || calcDistribution(resA.articles)
      });
      setDataB({
        articles: resB.articles,
        dist: resB.sentimentDistribution || calcDistribution(resB.articles)
      });

      toast.success('Comparison calculated!', { id: compareToast });
    } catch (err) {
      toast.error('Failed to compare topics', { id: compareToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compare-root">
       <div className="compare-search-header">
          <div className="compare-input-group">
            <input 
              type="text" 
              className="filter-input" 
              placeholder="Topic A..."
              value={topicA}
              onChange={(e) => setTopicA(e.target.value)}
            />
            <div className="compare-vs">vs</div>
            <input 
              type="text" 
              className="filter-input" 
              placeholder="Topic B..."
              value={topicB}
              onChange={(e) => setTopicB(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={handleCompare} disabled={loading}>
            {loading ? 'Comparing...' : t('compareMode')}
          </button>
       </div>

       {dataA && dataB && (
         <div className="compare-grid">
            <div className="compare-column">
               <h2 className="compare-topic-title">Analytics: {topicA}</h2>
               <SentimentPieChart distribution={dataA.dist} />
               <div style={{marginTop: 20}}>
                 <SentimentBarChart distribution={dataA.dist} />
               </div>
               <div className="compare-mini-list">
                 {dataA.articles.slice(0, 5).map(a => (
                   <div key={a.url} className="mini-card">
                      <div className={`mini-sentiment ${a.sentiment.toLowerCase()}`}>{a.sentiment[0]}</div>
                      <div className="mini-title">{a.title}</div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="compare-column">
               <h2 className="compare-topic-title">Analytics: {topicB}</h2>
               <SentimentPieChart distribution={dataB.dist} />
               <div style={{marginTop: 20}}>
                 <SentimentBarChart distribution={dataB.dist} />
               </div>
               <div className="compare-mini-list">
                 {dataB.articles.slice(0, 5).map(a => (
                   <div key={a.url} className="mini-card">
                      <div className={`mini-sentiment ${a.sentiment.toLowerCase()}`}>{a.sentiment[0]}</div>
                      <div className="mini-title">{a.title}</div>
                   </div>
                 ))}
               </div>
            </div>
         </div>
       )}

       {!dataA && !loading && (
         <div className="state-panel" style={{marginTop: 40}}>
           <div className="state-icon">⚖️</div>
           <p className="state-title">Topic Comparison Mode</p>
           <p className="state-sub">Enter two different topics to visualize their sentiment side-by-side.</p>
         </div>
       )}
    </div>
  );
};

export default ComparePage;
