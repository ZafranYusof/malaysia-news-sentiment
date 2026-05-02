import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExportPPT = ({ articles = [], distribution = {}, sources = [], query = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');

  const generatePresentation = async () => {
    setGenerating(true);
    setProgress('Loading PowerPoint library...');

    try {
      // Dynamic import of pptxgenjs
      const pptxgenModule = await import('pptxgenjs');
      const PptxGenJS = pptxgenModule.default || pptxgenModule;
      const pptx = new PptxGenJS();

      // Theme colors
      const colors = {
        brand: '1D4AFF',
        brandLight: '4D7AFF',
        dark: '0B0D14',
        surface: '1A1B2E',
        text: 'F0F1F5',
        textMuted: '8B8E99',
        positive: '34D882',
        negative: 'FF5C5C',
        neutral: 'FFAD33',
        white: 'FFFFFF',
      };

      pptx.author = 'MY News Sentiment Analysis';
      pptx.subject = `Sentiment Analysis Report - ${query || 'Dashboard'}`;
      pptx.title = 'Malaysia News Sentiment Report';

      // ─── Slide 1: Title ───────────────────────────────────
      setProgress('Creating title slide...');
      const slide1 = pptx.addSlide();
      slide1.background = { color: colors.dark };
      slide1.addText('Malaysia News\nSentiment Analysis', {
        x: 0.8, y: 1.5, w: 8.4, h: 2.5,
        fontSize: 36, fontFace: 'Segoe UI',
        color: colors.white, bold: true,
        align: 'left', lineSpacingMultiple: 1.2,
      });
      slide1.addText(query || 'Comprehensive Dashboard Report', {
        x: 0.8, y: 4.0, w: 8.4, h: 0.6,
        fontSize: 16, fontFace: 'Segoe UI',
        color: colors.brandLight, italic: true,
      });
      slide1.addText(`Generated: ${new Date().toLocaleDateString('en-MY', { dateStyle: 'long' })}`, {
        x: 0.8, y: 4.8, w: 8.4, h: 0.4,
        fontSize: 11, fontFace: 'Segoe UI',
        color: colors.textMuted,
      });
      // Accent bar
      slide1.addShape('rect', {
        x: 0.8, y: 1.2, w: 2.5, h: 0.06,
        fill: { color: colors.brand },
      });

      // ─── Slide 2: Executive Summary ───────────────────────
      setProgress('Building executive summary...');
      const slide2 = pptx.addSlide();
      slide2.background = { color: colors.dark };
      slide2.addText('Executive Summary', {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 24, fontFace: 'Segoe UI',
        color: colors.white, bold: true,
      });

      const total = articles.length;
      const posCount = distribution.Positive || 0;
      const negCount = distribution.Negative || 0;
      const neuCount = distribution.Neutral || 0;
      const dominantSentiment = posCount >= negCount && posCount >= neuCount ? 'Positive' :
        negCount >= posCount && negCount >= neuCount ? 'Negative' : 'Neutral';

      const summaryText = [
        `Total Articles Analyzed: ${total}`,
        `Dominant Sentiment: ${dominantSentiment}`,
        `Positive: ${posCount} (${total ? Math.round(posCount / total * 100) : 0}%)`,
        `Negative: ${negCount} (${total ? Math.round(negCount / total * 100) : 0}%)`,
        `Neutral: ${neuCount} (${total ? Math.round(neuCount / total * 100) : 0}%)`,
        '',
        `Analysis Period: ${articles.length > 0 ? new Date(articles[articles.length - 1]?.publishedAt || Date.now()).toLocaleDateString() : 'N/A'} - ${new Date().toLocaleDateString()}`,
      ].join('\n');

      slide2.addText(summaryText, {
        x: 0.5, y: 1.2, w: 9, h: 4,
        fontSize: 14, fontFace: 'Segoe UI',
        color: colors.text, lineSpacingMultiple: 1.6,
        valign: 'top',
      });

      // ─── Slide 3: Sentiment Distribution ──────────────────
      setProgress('Creating sentiment chart...');
      const slide3 = pptx.addSlide();
      slide3.background = { color: colors.dark };
      slide3.addText('Sentiment Distribution', {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 24, fontFace: 'Segoe UI',
        color: colors.white, bold: true,
      });

      // Pie chart data
      const chartData = [{
        name: 'Sentiment',
        labels: ['Positive', 'Negative', 'Neutral'],
        values: [posCount || 1, negCount || 1, neuCount || 1],
      }];

      slide3.addChart('pie', chartData, {
        x: 1.5, y: 1.2, w: 5, h: 4.5,
        showLegend: true,
        legendPos: 'r',
        legendFontSize: 12,
        legendColor: colors.text,
        chartColors: [colors.positive, colors.negative, colors.neutral],
        dataLabelColor: colors.white,
        showPercent: true,
        showValue: false,
        dataBorder: { pt: 1, color: colors.dark },
      });

      // ─── Slide 4: Top Entities ────────────────────────────
      setProgress('Adding entity analysis...');
      const slide4 = pptx.addSlide();
      slide4.background = { color: colors.dark };
      slide4.addText('Top Entities Mentioned', {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 24, fontFace: 'Segoe UI',
        color: colors.white, bold: true,
      });

      // Extract top entities from articles
      const entityCounts = {};
      const entityPatterns = [
        'Anwar Ibrahim', 'Muhyiddin', 'Najib', 'Mahathir', 'Rafizi',
        'UMNO', 'PKR', 'DAP', 'PAS', 'Bersatu', 'Petronas', 'Bank Negara',
        'Pakatan Harapan', 'Perikatan Nasional', 'Barisan Nasional',
      ];
      articles.forEach(a => {
        const text = `${a.title} ${a.description || ''}`;
        entityPatterns.forEach(entity => {
          if (text.toLowerCase().includes(entity.toLowerCase())) {
            entityCounts[entity] = (entityCounts[entity] || 0) + 1;
          }
        });
      });

      const topEntities = Object.entries(entityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      if (topEntities.length > 0) {
        const entityText = topEntities
          .map(([name, count], i) => `${i + 1}. ${name} — ${count} mentions`)
          .join('\n');

        slide4.addText(entityText, {
          x: 0.5, y: 1.2, w: 9, h: 4,
          fontSize: 14, fontFace: 'Segoe UI',
          color: colors.text, lineSpacingMultiple: 1.8,
          valign: 'top',
        });
      } else {
        slide4.addText('No significant entities detected in current dataset.', {
          x: 0.5, y: 2.5, w: 9, h: 1,
          fontSize: 14, fontFace: 'Segoe UI',
          color: colors.textMuted, align: 'center',
        });
      }

      // ─── Slide 5: Source Analysis ─────────────────────────
      setProgress('Adding source analysis...');
      const slide5 = pptx.addSlide();
      slide5.background = { color: colors.dark };
      slide5.addText('Source Analysis', {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 24, fontFace: 'Segoe UI',
        color: colors.white, bold: true,
      });

      // Source breakdown
      const sourceCounts = {};
      articles.forEach(a => {
        const src = a.source || 'Unknown';
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
      });

      const topSources = Object.entries(sourceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      if (topSources.length > 0) {
        const barData = [{
          name: 'Articles',
          labels: topSources.map(([name]) => name),
          values: topSources.map(([, count]) => count),
        }];

        slide5.addChart('bar', barData, {
          x: 0.5, y: 1.2, w: 9, h: 4.5,
          chartColors: [colors.brand],
          catAxisLabelColor: colors.text,
          valAxisLabelColor: colors.textMuted,
          catAxisLabelFontSize: 10,
          showValue: true,
          dataLabelColor: colors.white,
          dataLabelFontSize: 9,
          valGridLine: { color: '2A2B3E', size: 0.5 },
        });
      }

      // ─── Slide 6: Key Findings ────────────────────────────
      setProgress('Compiling key findings...');
      const slide6 = pptx.addSlide();
      slide6.background = { color: colors.dark };
      slide6.addText('Key Findings', {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 24, fontFace: 'Segoe UI',
        color: colors.white, bold: true,
      });

      const findings = [];
      if (total > 0) {
        findings.push(`• ${total} articles analyzed across ${Object.keys(sourceCounts).length} sources`);
        findings.push(`• Overall sentiment leans ${dominantSentiment.toLowerCase()} (${Math.round(Math.max(posCount, negCount, neuCount) / total * 100)}%)`);
        if (topEntities.length > 0) {
          findings.push(`• Most mentioned entity: ${topEntities[0][0]} (${topEntities[0][1]} articles)`);
        }
        if (topSources.length > 0) {
          findings.push(`• Top source: ${topSources[0][0]} (${topSources[0][1]} articles)`);
        }
        const alertCount = articles.filter(a => a.isAlert).length;
        if (alertCount > 0) {
          findings.push(`• ${alertCount} alert-level articles detected (high negative confidence)`);
        }
        findings.push(`• Sentiment confidence average: ${Math.round(articles.reduce((sum, a) => sum + (a.confidence || 0.5), 0) / total * 100)}%`);
      }

      slide6.addText(findings.join('\n') || 'No findings available.', {
        x: 0.5, y: 1.2, w: 9, h: 4,
        fontSize: 14, fontFace: 'Segoe UI',
        color: colors.text, lineSpacingMultiple: 1.8,
        valign: 'top',
      });

      // ─── Slide 7: Recommendations ────────────────────────
      setProgress('Generating recommendations...');
      const slide7 = pptx.addSlide();
      slide7.background = { color: colors.dark };
      slide7.addText('Recommendations', {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 24, fontFace: 'Segoe UI',
        color: colors.white, bold: true,
      });

      const recommendations = [
        '• Monitor sentiment trends daily for early detection of narrative shifts',
        '• Cross-reference multiple sources to validate sentiment patterns',
        '• Track entity co-occurrence for emerging political alliances or conflicts',
        '• Set up alerts for sudden negative sentiment spikes',
        '• Review source credibility scores when evaluating news reliability',
        '• Use time-series analysis to identify cyclical sentiment patterns',
      ];

      slide7.addText(recommendations.join('\n'), {
        x: 0.5, y: 1.2, w: 9, h: 4,
        fontSize: 14, fontFace: 'Segoe UI',
        color: colors.text, lineSpacingMultiple: 1.8,
        valign: 'top',
      });

      // Footer on all slides
      slide7.addText('Generated by MY News Sentiment Analysis Platform', {
        x: 0.5, y: 6.8, w: 9, h: 0.3,
        fontSize: 8, fontFace: 'Segoe UI',
        color: colors.textMuted, align: 'center',
      });

      // ─── Export ───────────────────────────────────────────
      setProgress('Generating file...');
      const filename = `sentiment-report-${query || 'dashboard'}-${new Date().toISOString().slice(0, 10)}.pptx`;
      await pptx.writeFile({ fileName: filename });

      setProgress('Done!');
      setTimeout(() => {
        setIsModalOpen(false);
        setGenerating(false);
        setProgress('');
      }, 1000);
    } catch (err) {
      console.error('PPT generation error:', err);
      setProgress(`Error: ${err.message}`);
      setTimeout(() => {
        setGenerating(false);
        setProgress('');
      }, 3000);
    }
  };

  return (
    <>
      <motion.button
        className="btn-text-only export-ppt-btn"
        onClick={() => setIsModalOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Export to PowerPoint"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
        PPTX
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="export-ppt-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !generating && setIsModalOpen(false)}
          >
            <motion.div
              className="export-ppt-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="export-ppt-header">
                <h3>Export to PowerPoint</h3>
                {!generating && (
                  <button className="export-ppt-close" onClick={() => setIsModalOpen(false)}>×</button>
                )}
              </div>

              <div className="export-ppt-body">
                {!generating ? (
                  <>
                    <p className="export-ppt-desc">
                      Generate a professional presentation with your current analysis data.
                    </p>
                    <div className="export-ppt-slides-preview">
                      <div className="slide-preview-item">📊 Title Slide</div>
                      <div className="slide-preview-item">📋 Executive Summary</div>
                      <div className="slide-preview-item">🥧 Sentiment Distribution</div>
                      <div className="slide-preview-item">👤 Top Entities</div>
                      <div className="slide-preview-item">📰 Source Analysis</div>
                      <div className="slide-preview-item">🔍 Key Findings</div>
                      <div className="slide-preview-item">💡 Recommendations</div>
                    </div>
                    <div className="export-ppt-stats">
                      <span>{articles.length} articles</span>
                      <span>•</span>
                      <span>7 slides</span>
                      <span>•</span>
                      <span>Dark theme</span>
                    </div>
                    <motion.button
                      className="export-ppt-generate-btn"
                      onClick={generatePresentation}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Generate Presentation
                    </motion.button>
                  </>
                ) : (
                  <div className="export-ppt-progress">
                    <div className="export-ppt-spinner" />
                    <p>{progress}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExportPPT;
