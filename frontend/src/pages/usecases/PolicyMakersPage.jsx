import React from 'react';
import { Users, TrendingUp, MapPin, BarChart3 } from 'lucide-react';
import UseCaseLayout from './UseCaseLayout';

const PolicyMakersPage = () => (
  <UseCaseLayout
    badge="For Government & Policy Makers"
    title={<>Understand public sentiment to shape <span className="text-accent">better policies</span></>}
    subtitle="Track public opinion on policies, measure the impact of government initiatives, monitor regional sentiment differences, and forecast opinion trends across Malaysian media."
    features={[
      {
        icon: Users,
        title: 'Public Opinion Tracking',
        desc: 'Monitor how citizens respond to policies through media sentiment. Track approval trends for government initiatives in real-time.',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      },
      {
        icon: BarChart3,
        title: 'Policy Impact Measurement',
        desc: 'Measure before-and-after sentiment shifts when policies are announced. Quantify media reception of government decisions.',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      },
      {
        icon: MapPin,
        title: 'Regional Sentiment Analysis',
        desc: 'See how different states and regions respond to national policies. Identify areas of support and concern geographically.',
        color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      },
      {
        icon: TrendingUp,
        title: 'Sentiment Forecasting',
        desc: 'AI-powered predictions on how public opinion may shift. Early warning system for potential backlash or support surges.',
        color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      },
    ]}
    steps={[
      { num: '01', title: 'Monitor Policies', desc: 'Track specific policies, ministers, or government programs. Set up dashboards for your portfolio areas.' },
      { num: '02', title: 'Measure Impact', desc: 'See real-time sentiment changes after announcements. Compare media reception across outlets and regions.' },
      { num: '03', title: 'Forecast & Act', desc: 'Use AI predictions to anticipate public response. Make data-informed decisions on communication strategies.' },
    ]}
  />
);

export default PolicyMakersPage;
