import { readFileSync, writeFileSync } from 'fs';

const f = 'c:/Users/zafra/.gemini/antigravity/scratch/malaysia-news-sentiment/frontend/src/pages/StaticPage.jsx';
let c = readFileSync(f, 'utf8');

// Replace all corrupted emoji sequences with the correct emoji
// Mission icons
c = c.replace(/'[^']*dYZ_[^']*'/g, "'🎯'");
c = c.replace(/'[^']*dYO[^']*'/g, (m) => m.includes('?') ? "'🌐'" : m);
c = c.replace(/'dY"[^']*'/g, (m) => {
  if (m.includes('\u2013') || m.length < 8) return "'🔬'";
  return m;
});
c = c.replace(/'dYq[^']*'/g, "'🤝'");

// Team emojis
c = c.replace(/emoji:\s*'[^']*dY[^']*'/g, (m) => {
  if (m.includes('`')) return "emoji: '👨‍💻'";
  if (m.includes('\u0015')) return "emoji: '🧠'";
  if (m.includes('Z"')) return "emoji: '🎨'";
  if (m.includes('\u00b4') || m.includes('Raj') || m.includes('Kumar')) return "emoji: '⚙️'";
  return m;
});

// Jobs perks emojis (array items starting the perk cards)
c = c.replace(/'[^']*dY\u2022[^']*'/g, "'🏡'");
c = c.replace(/'[^']*dYd[^']*'/g, "'📈'");
c = c.replace(/'[^']*dYŽ´[^']*'/g, "'🌴'");

// Fix em-dash
c = c.replace(/\u00e2\u20ac\u201d/g, '—');
c = c.replace(/\ufffd[^a-zA-Z]/g, '—');

writeFileSync(f, c, 'utf8');
console.log('Emojis fixed!');
