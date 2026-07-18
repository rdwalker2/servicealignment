// linkedin-setup.js
// ============================================================
// LinkedIn Session Capture — improved version
// 
// Strategy 1 (preferred): Pull li_at directly from your real Chrome profile
//   → Session lasts weeks, not minutes
//
// Strategy 2 (fallback): Open browser window, log in manually
// ============================================================

import { chromium } from 'playwright';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import * as readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.join(__dirname, '..', 'data', 'linkedin-session.json');

function prompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer); });
  });
}

// Try to extract li_at cookie from Chrome's real cookie database (Mac)
function extractFromChrome() {
  try {
    // Chrome stores cookies in SQLite — we need to read it while Chrome is closed
    // or use the Cookies file path
    const chromeCookiePath = path.join(
      process.env.HOME,
      'Library/Application Support/Google/Chrome/Default/Cookies'
    );
    if (!existsSync(chromeCookiePath)) return null;

    // Use sqlite3 CLI to extract li_at cookie
    const result = execSync(
      `sqlite3 "${chromeCookiePath}" "SELECT value FROM cookies WHERE host_key='.linkedin.com' AND name='li_at' LIMIT 1;" 2>/dev/null`,
      { encoding: 'utf-8', timeout: 5000 }
    ).trim();

    if (result && result.length > 20) {
      console.log('✅ Found li_at in Chrome cookie database (encrypted — will use browser method instead)');
      return null; // Chrome encrypts cookies on Mac, need browser method
    }
  } catch {
    // sqlite3 not available or Chrome is open
  }
  return null;
}

// Main approach: use Chrome's existing profile (keeps you logged in automatically)
async function captureWithExistingProfile() {
  const chromeProfilePath = path.join(
    process.env.HOME,
    'Library/Application Support/Google/Chrome'
  );

  if (!existsSync(chromeProfilePath)) {
    console.log('Chrome profile not found — using manual login method');
    return false;
  }

  console.log('Found Chrome profile — opening LinkedIn with your existing session...');
  console.log('(Make sure Chrome is fully closed before continuing)\n');
  
  await prompt('Press Enter when Chrome is closed to continue...');

  try {
    const browser = await chromium.launchPersistentContext(chromeProfilePath, {
      headless: false,
      channel: 'chrome',
      args: ['--start-maximized', '--no-first-run', '--no-default-browser-check'],
    });

    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise(r => setTimeout(r, 3000));

    const url = page.url();
    if (url.includes('/login') || url.includes('/checkpoint')) {
      console.log('Not logged into LinkedIn in Chrome — switching to manual method');
      await browser.close();
      return false;
    }

    console.log('✅ Already logged into LinkedIn via Chrome profile!');
    
    // Save storage state
    const storageState = await browser.storageState();
    writeFileSync(SESSION_PATH, JSON.stringify(storageState, null, 2));
    
    const liAt = storageState.cookies.find(c => c.name === 'li_at');
    await browser.close();
    
    if (liAt) {
      console.log(`✅ Session saved to: ${SESSION_PATH}`);
      console.log('   li_at cookie expires:', new Date(liAt.expires * 1000).toDateString());
      return true;
    }
    return false;
  } catch (e) {
    console.log('Chrome profile method failed:', e.message);
    return false;
  }
}

// Fallback: manual login in fresh browser
async function captureManually() {
  console.log('\nOpening fresh browser for manual LinkedIn login...');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  await page.goto('https://www.linkedin.com/login');
  console.log('Browser opened. Please log in to LinkedIn now.\n');

  await prompt('Once you are on the LinkedIn homepage/feed, press Enter here...');

  const url = page.url();
  if (url.includes('/login') || url.includes('/checkpoint')) {
    console.log('⚠️  Looks like login did not complete. Please make sure you are on the LinkedIn feed before pressing Enter.');
    await prompt('Press Enter again once you are on the feed...');
  }

  const storageState = await context.storageState();
  writeFileSync(SESSION_PATH, JSON.stringify(storageState, null, 2));

  const liAt = storageState.cookies.find(c => c.name === 'li_at');
  await browser.close();

  if (liAt) {
    console.log('\n✅ Session captured! li_at cookie found.');
    console.log(`   Saved to: ${SESSION_PATH}`);
    console.log(`   Expires: ${new Date(liAt.expires * 1000).toDateString()}`);
    return true;
  } else {
    console.log('\n❌ li_at not found — make sure you are fully logged in before pressing Enter');
    return false;
  }
}

async function main() {
  console.log('LinkedIn Session Setup');
  console.log('======================\n');
  console.log('⚠️  Recommendation: use a secondary LinkedIn account to protect your main one.\n');

  // Try Chrome profile first (keeps session longer)
  const profileSuccess = await captureWithExistingProfile();
  
  if (!profileSuccess) {
    // Fall back to manual login
    await captureManually();
  }
  
  console.log('\nDone! Now run: node scraper/linkedin-people-scraper.js');
}

main().catch(console.error);
