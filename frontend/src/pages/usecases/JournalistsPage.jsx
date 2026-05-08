import React from 'react';
import { ShieldCheck, BarChart3, Bell, Eye } from 'lucide-react';
import UseCaseLayout from './UseCaseLayout';

const JournalistsPage = () => (
  <UseCaseLayout
    badge="For Journalists & Media"
    title={<>Uncover bias and track stories with <span className="text-accent">AI precision</span></>}
    subtitle="Compare how different outlets cover the same story, detect bias patterns, monitor source credibility, and get real-time alerts on breaking narratives across Malaysian media."
    features={[
      {
        icon: ShieldCheck,
        title: 'Source Credibility Scoring',
        desc: 'Evaluate reliability of news sources based on historical accuracy, bias patterns, and editorial standards. Know which sources to trust.',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      },
      {
        icon: BarChart3,
        title: 'Multi-Outlet Comparison',
        desc: 'See how The Star, Malaysiakini, Bernama, and 50+ outlets cover the same story differently. Spot editorial bias at a glance.',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      },
      {
        icon: Bell,
        title: 'Real-Time Story Alerts',
        desc: 'Get notified when sentiment shifts dramatically on topics you follow. Never miss a breaking narrative or sudden opinion change.',
        color: 'bg-red-500/10 text-red-600 dark:text-red-400',
      },
      {
        icon: Eye,
        title: 'Bias Detection Engine',
        desc: 'AI-powered analysis identifies loaded language, framing techniques, and sentiment manipulation across articles and outlets.',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      },
    ]}
    steps={[
      { num: '01', title: 'Track a Story', desc: 'Enter any topic or event. Our system finds all coverage across Malaysian outlets and maps the narrative landscape.' },
      { num: '02', title: 'Compare Coverage', desc: 'See side-by-side sentiment analysis showing how different outlets frame the same story with different biases.' },
      { num: '03', title: 'Verify & Report', desc: 'Use credibility scores and bias detection to inform your reporting with data-backed media analysis.' },
    ]}
  />
);

export default JournalistsPage;
