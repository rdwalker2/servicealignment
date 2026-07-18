// rippling-contacts/scraper/g2-review-miner.js
// ============================================================
// G2 Review Miner — extracts HR/TA leaders who reviewed Rippling ATS on G2
// These are the HIGHEST-INTENT contacts: they publicly complained about Rippling
// Uses Playwright (headless) since Apify API requires account setup
// ============================================================

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const SUPABASE_URL = 'https://tqmpaaxocpwmziivxkym.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// G2 pages to mine — Rippling and ADP reviewers
const G2_TARGETS = [
  {
    url: 'https://www.g2.com/products/rippling/reviews',
    product: 'Rippling',
    relevance: 'churned_or_unhappy_rippling_user',
    audience_source: 'rippling',
  },
  {
    url: 'https://www.g2.com/products/adp-workforce-now/reviews',
    product: 'ADP Workforce Now',
    relevance: 'active_adp_user',
    audience_source: 'adp',
  },
];

// HR title keywords to filter relevant reviewers
const HR_TITLE_KEYWORDS = [
  'talent acquisition', 'recruiting', 'recruiter',
  'chief people', 'chro', 'vp of people', 'vp people', 'head of people',
  'vp of hr', 'vp hr', 'hr director', 'director of hr', 'director of human',
  'people operations', 'hr operations', 'hris', 'hr systems',
  'hr manager', 'human resources manager', 'hr business partner',
  'hiring manager', 'workforce', 'compensation', 'benefits',
];

function isHRTitle(title) {
  if (!title) return false;
  const lower = title.toLowerCase();
  return HR_TITLE_KEYWORDS.some(k => lower.includes(k));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function mineG2Page(page, target, maxPages = 20) {
  const reviews = [];
  
  console.log(`\nMining: ${target.url}`);
  await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);

  for (let pageNum = 0; pageNum < maxPages; pageNum++) {
    // Extract review cards
    const pageReviews = await page.evaluate(() => {
      const cards = document.querySelectorAll('[itemprop="review"], .paper.paper--white.paper--box, [class*="review-card"]');
      const results = [];
      
      cards.forEach(card => {
        const name = card.querySelector('[class*="author-name"], [itemprop="author"], .gh-preview-toggle-anchor')?.textContent?.trim();
        const title = card.querySelector('[class*="reviewer-title"], [class*="user-role"], [class*="title-info"]')?.textContent?.trim();
        const company = card.querySelector('[class*="company"], [class*="market-segment"]')?.textContent?.trim();
        const rating = card.querySelector('[class*="stars"], [class*="rating"]')?.getAttribute('aria-label') || 
                       card.querySelector('[class*="star"]')?.textContent?.trim();
        const reviewTitle = card.querySelector('[class*="review-title"], h3, h4')?.textContent?.trim();
        const reviewBody = card.querySelector('[class*="review-body"], [class*="body"], p')?.textContent?.trim();
        const pros = card.querySelector('[class*="pros"], [id*="pros"]')?.textContent?.trim();
        const cons = card.querySelector('[class*="cons"], [id*="cons"]')?.textContent?.trim();
        const date = card.querySelector('time, [datetime]')?.getAttribute('datetime') || 
                     card.querySelector('[class*="date"]')?.textContent?.trim();
        
        if (name || title) {
          results.push({ name, title, company, rating, reviewTitle, reviewBody, pros, cons, date });
        }
      });
      
      return results;
    });

    // Filter to HR-relevant titles
    const hrReviews = pageReviews.filter(r => isHRTitle(r.title));
    
    if (pageReviews.length > 0) {
      console.log(`  Page ${pageNum + 1}: ${pageReviews.length} reviews, ${hrReviews.length} HR-relevant`);
    }

    hrReviews.forEach(r => {
      reviews.push({
        ...r,
        product: target.product,
        relevance: target.relevance,
        audience_source: target.audience_source,
        source: 'g2_review',
        persona_rank: mapPersonaRank(r.title),
        scraped_at: new Date().toISOString(),
      });
    });

    // Try to go to next page
    const nextBtn = await page.$('[aria-label="Next"], .pagination__next, a[data-page]');
    if (!nextBtn) break;
    
    // Check if next is disabled
    const isDisabled = await nextBtn.evaluate(el => el.classList.contains('disabled') || el.hasAttribute('disabled'));
    if (isDisabled) break;
    
    await nextBtn.click();
    await sleep(2000 + Math.random() * 2000);
  }

  return reviews;
}

function mapPersonaRank(title) {
  if (!title) return 4;
  const t = title.toLowerCase();
  if (['talent acquisition', 'recruiting', 'recruiter'].some(k => t.includes(k))) return 1;
  if (['chief people', 'chro', 'vp of people', 'vp people', 'head of people', 'vp of hr', 'vp hr'].some(k => t.includes(k))) return 2;
  if (['hr ops', 'hris', 'hr system', 'hr operation', 'people operation', 'hr director', 'hr manager'].some(k => t.includes(k))) return 3;
  return 4;
}

async function main() {
  console.log('G2 Review Miner — HR Contact Intelligence');
  console.log('==========================================\n');
  console.log('Mining reviews from Rippling and ADP G2 pages...');
  console.log('These contacts TOLD US their pain points. Use reviews in outreach.\n');

  const outputPath = path.join(DATA_DIR, 'g2_hr_contacts.json');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
  });

  const page = await context.newPage();
  // Remove webdriver flag
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const allReviews = [];

  for (const target of G2_TARGETS) {
    const reviews = await mineG2Page(page, target);
    allReviews.push(...reviews);
    console.log(`  Found ${reviews.length} HR-relevant contacts from ${target.product}`);
    await sleep(3000);
  }

  await browser.close();

  // Stats
  const byProduct = {};
  const byTier = { 1: 0, 2: 0, 3: 0, 4: 0 };
  allReviews.forEach(r => {
    byProduct[r.product] = (byProduct[r.product] || 0) + 1;
    byTier[r.persona_rank] = (byTier[r.persona_rank] || 0) + 1;
  });

  writeFileSync(outputPath, JSON.stringify(allReviews, null, 2));

  console.log(`\n✅ G2 mining complete`);
  console.log(`   Total HR contacts: ${allReviews.length}`);
  console.log(`   By product: ${JSON.stringify(byProduct)}`);
  console.log(`   Tier 1 (TA Leaders): ${byTier[1]}`);
  console.log(`   Tier 2 (CHRO/VP People): ${byTier[2]}`);
  console.log(`   Tier 3 (HR Ops): ${byTier[3]}`);
  console.log(`\n💡 G2 contacts include review text — USE IT in outreach personalization!`);
  console.log(`Saved to: rippling-contacts/data/g2_hr_contacts.json`);
  console.log(`\nNext: run export-contacts-csv.js`);
}

main().catch(console.error);
