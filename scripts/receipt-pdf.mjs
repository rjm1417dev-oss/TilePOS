#!/usr/bin/env node
/**
 * Generates a receipt PDF with page height matching content.
 * Usage: node scripts/receipt-pdf.mjs <path-to-html-file>
 * Output: PDF bytes to stdout
 */

import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { launch } from 'puppeteer';
const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = process.argv[2];
const chromePath = process.env.BROWSERSHOT_CHROME_PATH || '/usr/bin/google-chrome';

if (!htmlPath) {
  console.error('Usage: node scripts/receipt-pdf.mjs <path-to-html-file>');
  process.exit(1);
}

const absPath = resolve(htmlPath);
let browser;
try {
  browser = await launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  const fileUrl = `file://${absPath}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');

  const pdfBuffer = await page.pdf({
    width: '80mm',
    height: '297mm',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  process.stdout.write(Buffer.from(pdfBuffer));
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  if (browser) {
    await browser.close();
  }
}
