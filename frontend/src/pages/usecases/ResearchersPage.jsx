import React from 'react';
import { TrendingUp, FileDown, Network, Search } from 'lucide-react';
import UseCaseLayout from './UseCaseLayout';

const ResearchersPage = () => (
  <UseCaseLayout
    badge="For Academic Researchers"
    title={<>Rigorous sentiment data for <span className="text-accent">academic research</span></>}
    subtitle="Track media sentiment trends, export citation-ready data, and uncover entity relationships for your thesis, papers, and research projects on Malaysian politics, economy, and social issues."
    features={[
      {
        icon: TrendingUp,
        title: 'Historical Trend Analysis',
        desc: 'Access months of sentiment data to identify long-term media narrative shifts. Perfect for longitudinal studies on Malaysian public discourse.',
        color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      },
      {
        icon: FileDown,
        title: 'Citation-Ready Exports',
        desc: 'Export analysis results as structured CSV or PowerPoint reports. Formatted for academic papers with timestamps, sources, and confidence scores.',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      },
      {
        icon: Network,
        title: 'Entity Relationship Mapping',
        desc: 'Visualize connections between politicians, organizations, and events. Discover hidden patterns in how Malaysian media covers key figures.',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      },
      {
        icon: Search,
        title: 'Advanced Filtering & Search',
        desc: 'Filter by date range, source, topic, sentiment polarity, and entity. Build precise datasets for your specific research questions.',
        color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      },
    ]}
    steps={[
      { num: '01', title: 'Define Your Query', desc: 'Set your research parameters — topic, date range, sources, and sentiment filters to build your dataset.' },
      { num: '02', title: 'Analyze Patterns', desc: 'Explore interactive visualizations showing sentiment trends, entity networks, and source comparisons.' },
      { num: '03', title: 'Export & Cite', desc: 'Download structured data exports ready for your thesis, paper, or presentation with full source attribution.' },
    ]}
  />
);

export default ResearchersPage;
