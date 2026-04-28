/**
 * Export a list of analyzed articles to a CSV file.
 * (#14) export to CSV
 */

// Sanitise a cell value to prevent CSV formula injection (=, +, -, @, \t, \r)
const sanitizeCell = (val) => {
  const str = String(val || '');
  if (/^[=+\-@\t\r]/.test(str)) return `'${str}`;
  return str;
};

export const exportToCSV = (articles, filename = 'malaysia-news-sentiment-analysis.csv') => {
  if (!articles || articles.length === 0) return;

  // CSV headers
  const headers = ['Date', 'Source', 'Title', 'Sentiment', 'Confidence', 'Reason', 'Link', 'Alert'];
  
  const rows = articles.map(a => [
    new Date(a.publishedAt || a.createdAt).toISOString().split('T')[0],
    `"${sanitizeCell(a.source || 'Unknown').replace(/"/g, '""')}"`,
    `"${sanitizeCell(a.title || '').replace(/"/g, '""')}"`,
    a.sentiment,
    `${Math.round((a.confidence || 0) * 100)}%`,
    `"${sanitizeCell(a.reason || '').replace(/"/g, '""')}"`,
    sanitizeCell(a.url),
    a.isAlert ? 'YES' : 'NO'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  // UTF-8 BOM for proper encoding in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
