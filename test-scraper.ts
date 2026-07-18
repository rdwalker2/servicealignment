import { chromium } from 'playwright';
async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://html.duckduckgo.com/html/?q=151+Regal+Row+Dallas+TX+roof+permit');
  const text = await page.innerText('body');
  console.log(text.substring(0, 500));
  await browser.close();
}
run();
