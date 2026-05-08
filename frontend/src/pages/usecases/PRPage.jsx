import React from 'react';
import { Bell, Target, BarChart3, Eye } from 'lucide-react';
import UseCaseLayout from './UseCaseLayout';

const PRPage = () => (
  <UseCaseLayout
    badge="For PR & Communications"
    title={<>Monitor your brand and manage <span className="text-accent">media narratives</span></>}
    subtitle="Track brand mentions across Malaysian media, detect crises early, measure campaign effectiveness, and benchmark against competitors — all with AI-powered sentiment analysis."
    features={[
      {
        icon: Bell,
        title: 'Crisis Early Warning',
        desc: 'Get instant alerts when negative sentiment spikes around your brand. Detect potential PR crises before they escalate in Malaysian media.',
        color: 'bg-red-500/10 text-red-600 dark:text-red-400',
      },
      {
        icon: Target,
        title: 'Campaign Effectiveness',
        desc: 'Measure how your PR campaigns shift media sentiment. Track before, during, and after metrics for every initiative.',
        color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      },
      {
        icon: Eye,
        title: 'Competitor Analysis',
        desc: 'Monitor competitor brand sentiment alongside yours. Identify opportunities when competitors face negative coverage.',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      },
      {
        icon: BarChart3,
        title: 'Media Coverage Reports',
        desc: 'Auto-generated reports showing share of voice, sentiment breakdown, and key narrative themes across all Malaysian outlets.',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      },
    ]}
    steps={[
      { num: '01', title: 'Set Up Brand Monitors', desc: 'Configure tracking for your brand, products, executives, and competitors across 50+ Malaysian news sources.' },
      { num: '02', title: 'Monitor & Alert', desc: 'Real-time dashboard shows brand sentiment, volume, and key narratives. Get alerts on significant changes.' },
      { num: '03', title: 'Report & Optimize', desc: 'Generate stakeholder reports showing campaign impact, media coverage trends, and competitive positioning.' },
    ]}
  />
);

export default PRPage;
