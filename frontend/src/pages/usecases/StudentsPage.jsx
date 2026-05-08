import React from 'react';
import { GraduationCap, Brain, Code, Sparkles } from 'lucide-react';
import UseCaseLayout from './UseCaseLayout';

const StudentsPage = () => (
  <UseCaseLayout
    badge="For University Students"
    title={<>Learn NLP hands-on with <span className="text-accent">real Malaysian data</span></>}
    subtitle="Perfect for FYP projects, coursework, and learning AI/NLP concepts. Get hands-on experience with real sentiment analysis on Malaysian news — completely free for students."
    features={[
      {
        icon: Brain,
        title: 'Learn NLP Concepts',
        desc: 'See real transformer models in action — sentiment classification, entity extraction, and text analysis on actual Malaysian news articles.',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      },
      {
        icon: GraduationCap,
        title: 'FYP-Ready Tool',
        desc: 'Use as a reference implementation or data source for your Final Year Project. Built by a fellow UMPSA student who understands FYP requirements.',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      },
      {
        icon: Code,
        title: 'Coursework Data Source',
        desc: 'Access structured sentiment data for assignments in Data Science, AI, NLP, or Software Engineering courses. Export in multiple formats.',
        color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      },
      {
        icon: Sparkles,
        title: 'Free Student Access',
        desc: 'All features are completely free. No credit card, no trial period. Built as a university research project, open for all students to use.',
        color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
      },
    ]}
    steps={[
      { num: '01', title: 'Sign Up Free', desc: 'Create your account in seconds. No payment required — this platform is built for students, by students.' },
      { num: '02', title: 'Explore & Learn', desc: 'Analyze Malaysian news sentiment, explore entity graphs, and see how NLP models classify text in real-time.' },
      { num: '03', title: 'Use in Your Project', desc: 'Export data for your FYP, reference the methodology in your thesis, or use the API for your own applications.' },
    ]}
  />
);

export default StudentsPage;
