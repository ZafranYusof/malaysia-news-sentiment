/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import ArticleDetailPanel from '../components/ArticleDetailPanel';

const ArticleAnalysisContext = createContext();

export const ArticleAnalysisProvider = ({ children }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const openArticlePanel = (article) => {
    setSelectedArticle(article);
    setIsPanelOpen(true);
  };

  const closeArticlePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <ArticleAnalysisContext.Provider value={{ openArticlePanel, closeArticlePanel }}>
      {children}
      <ArticleDetailPanel 
        article={selectedArticle} 
        isOpen={isPanelOpen} 
        onClose={closeArticlePanel} 
      />
    </ArticleAnalysisContext.Provider>
  );
};

export const useArticleAnalysis = () => useContext(ArticleAnalysisContext);
