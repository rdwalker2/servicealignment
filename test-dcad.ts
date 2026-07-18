import { chromium } from 'playwright';
async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  await page.goto('https://www.dallascad.org/SearchAddr.aspx');
  await page.fill('#txtAddrNum', '151');
  await page.fill('#txtStName', 'REGAL');
  await Promise.all([
    page.waitForNavigation(),
    page.click('#cmdSubmit')
  ]);
  const text = await page.innerText('body');
  console.log(text.substring(0, 1500));
  await browser.close();
}
run();
