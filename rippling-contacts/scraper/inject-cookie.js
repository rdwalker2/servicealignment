// inject-cookie.js
// ============================================================
// Manually inject your li_at cookie — paste it as an argument
// Usage: node scraper/inject-cookie.js "AQEDATxxxxxx..."
// ============================================================

import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.join(__dirname, '..', 'data', 'linkedin-session.json');

const liAt = process.argv[2];

if (!liAt || liAt.length < 20) {
  console.log('Usage: node scraper/inject-cookie.js "YOUR_LI_AT_VALUE"');
  console.log('');
  console.log('To find your li_at cookie:');
  console.log('  1. Open Chrome and go to linkedin.com');
  console.log('  2. Press F12 → Application tab → Cookies → www.linkedin.com');
  console.log('  3. Find the row named "li_at" → copy the Value column');
  console.log('  4. Paste it as the argument to this script');
  process.exit(1);
}

const storageState = {
  cookies: [
    {
      name: 'li_at',
      value: liAt.trim(),
      domain: '.www.linkedin.com',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    },
    // Also set for the root domain
    {
      name: 'li_at',
      value: liAt.trim(),
      domain: '.linkedin.com',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    },
  ],
  origins: [],
};

writeFileSync(SESSION_PATH, JSON.stringify(storageState, null, 2));
console.log(`✅ li_at injected into ${SESSION_PATH}`);
console.log(`   Cookie length: ${liAt.trim().length} chars`);
console.log('');
console.log('Now run: node scraper/linkedin-people-scraper.js');
