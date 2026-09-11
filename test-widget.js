const { chromium } = require('C:/Users/lucas/mariana-sync/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('https://loja.laeva.com.br/products/legging-coracao', { waitUntil: 'commit', timeout: 15000 });
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  await page.addScriptTag({ path: path.join(__dirname, 'provador-laeva.js') });
  await page.waitForTimeout(1500);
  const product = {
    inlineButtons: await page.locator('.laeva-inline-trigger').count(),
    floatingButtons: await page.locator('#mc-open-ia').count(),
  };
  await page.evaluate(() => document.querySelector('.laeva-inline-trigger').click());
  await page.waitForTimeout(100);
  product.modalDisplay = await page.locator('#mc-modal-ia').evaluate(el => getComputedStyle(el).display);
  product.modalVisible = await page.locator('#mc-modal-ia').isVisible();
  product.phoneInputs = await page.locator('#mc-step-upload #mc-phone').count();

  const home = await browser.newPage();
  home.setDefaultTimeout(15000);
  await home.goto('https://loja.laeva.com.br/', { waitUntil: 'commit', timeout: 15000 });
  await home.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  await home.addScriptTag({ path: path.join(__dirname, 'provador-laeva.js') });
  await home.waitForTimeout(500);
  const homepageButtons = await home.locator('.laeva-inline-trigger, #mc-open-ia').count();

  console.log(JSON.stringify({ product, homepageButtons, errors }, null, 2));
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
