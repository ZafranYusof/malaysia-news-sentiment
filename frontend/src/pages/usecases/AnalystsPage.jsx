import React from 'react';
import { LineChart, Zap, FileDown, Code } from 'lucide-react';
import UseCaseLayout from './UseCaseLayout';

const AnalystsPage = () => (
  <UseCaseLayout
    badge="For Data & Market Analysts"
    title={<>Real-time sentiment intelligence for <span className="text-accent">smarter decisions</span></>}
    subtitle="Monitor market sentiment, track brand mentions, access our API for custom integrations, and generate automated reports — all powered by AI analysis of Malaysian news."
    features={[
      {
        icon: LineChart,
        title: 'Real-Time Dashboard',
        desc: 'Live sentiment tracking across sectors — politics, economy, tech, and more. See market-moving narratives as they develop.',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      },
      {
        icon: Zap,
        title: 'Brand & Market Monitoring',
        desc: 'Track sentiment around companies, sectors, and economic indicators. Correlate media sentiment with market movements.',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      },
      {
        icon: Code,
        title: 'API Access',
        desc: 'Integrate sentiment data into your own tools and dashboards. RESTful API with real-time webhooks and historical data endpoints.',
        color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      },
      {
        icon: FileDown,
        title: 'Custom Report Generation',
        desc: 'Auto-generate PowerPoint and CSV reports with your branding. Schedule daily, weekly, or monthly sentiment summaries.',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      },
    ]}
    steps={[
      { num: '01', title: 'Set Up Monitors', desc: 'Configure watchlists for companies, sectors, or topics you need to track. Set alert thresholds for sentiment shifts.' },
      { num: '02', title: 'Analyze in Real-Time', desc: 'View live dashboards with sentiment scores, trend lines, and volume indicators across your monitored topics.' },
      { num: '03', title: 'Export & Integrate', desc: 'Pull data via API into your existing tools or download automated reports for stakeholder presentations.' },
    ]}
  />
);

export default AnalystsPage;
