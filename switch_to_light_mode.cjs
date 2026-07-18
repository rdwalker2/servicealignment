const fs = require('fs');
const path = './src/components/discovery/BusinessCaseDocument.css';
let css = fs.readFileSync(path, 'utf8');

// Replace Root variables
css = css.replace('--color-bg: #09090b;', '--color-bg: #f8fafc;'); // slate-50
css = css.replace('--color-bg-subtle: #18181b;', '--color-bg-subtle: #ffffff;'); 
css = css.replace('--color-bg-warm: #27272a;', '--color-bg-warm: #f1f5f9;'); // slate-100

css = css.replace('--color-text: #f8fafc;', '--color-text: #0f172a;'); // slate-900
css = css.replace('--color-text-secondary: #a1a1aa;', '--color-text-secondary: #475569;'); // slate-600
css = css.replace('--color-text-muted: #71717a;', '--color-text-muted: #64748b;'); // slate-500

css = css.replace('--color-border: rgba(255, 255, 255, 0.1);', '--color-border: rgba(0, 0, 0, 0.1);');
css = css.replace('--color-border-light: rgba(255, 255, 255, 0.05);', '--color-border-light: rgba(0, 0, 0, 0.05);');

css = css.replace('--shadow-sm: 0 1px 2px rgba(0,0,0,0.4);', '--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);');
css = css.replace('--shadow-md: 0 4px 12px rgba(0,0,0,0.5);', '--shadow-md: 0 4px 12px rgba(0,0,0,0.08);');
css = css.replace('--shadow-lg: 0 8px 30px rgba(0,0,0,0.6);', '--shadow-lg: 0 8px 30px rgba(0,0,0,0.12);');
css = css.replace('--shadow-xl: 0 20px 60px rgba(0,0,0,0.8);', '--shadow-xl: 0 20px 60px rgba(0,0,0,0.15);');

// Replace hardcoded dark-mode background colors in the rest of the file
css = css.replace(/rgba\(255, ?255, ?255, ?([0-9.]+)\)/g, (match, p1) => {
  return `rgba(0, 0, 0, ${p1})`;
});

css = css.replace(/background: rgba\(24, 24, 27, 0\.6\);/g, 'background: rgba(255, 255, 255, 0.85);');

// Change hardcoded white text to dark text
css = css.replace(/color: #fff;/g, 'color: var(--color-text);');

fs.writeFileSync(path, css);
console.log('Successfully switched to light mode!');
