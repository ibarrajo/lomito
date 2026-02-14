/**
 * Playwright smoke test for Lomito web app.
 * Validates the app renders without crashing on http://localhost:8081.
 *
 * Usage: node test-web.mjs
 * Requires: expo dev server running on port 8081
 */
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
const consoleLogs = [];

page.on('console', (msg) => {
  consoleLogs.push({ type: msg.type(), text: msg.text() });
});

page.on('pageerror', (err) => {
  errors.push(err.message);
});

let exitCode = 0;

try {
  console.log('Navigating to http://localhost:8081...');
  await page.goto('http://localhost:8081', {
    waitUntil: 'networkidle',
    timeout: 60000,
  });

  // Wait for React to render
  await page.waitForTimeout(5000);

  // Check title
  const title = await page.title();
  console.log(`Title: ${title}`);
  if (title !== 'Lomito') {
    console.error(`FAIL: Expected title "Lomito", got "${title}"`);
    exitCode = 1;
  }

  // Check that #root has content (not blank)
  const rootChildCount = await page.evaluate(
    () => document.getElementById('root')?.childElementCount ?? 0,
  );
  if (rootChildCount === 0) {
    console.error('FAIL: #root has no children — blank page');
    exitCode = 1;
  } else {
    console.log(`#root has ${rootChildCount} child element(s)`);
  }

  // Check for fatal React errors (invalid hook call, etc.)
  const fatalErrors = consoleLogs.filter(
    (l) =>
      l.type === 'error' &&
      (l.text.includes('Invalid hook call') ||
        l.text.includes("Cannot read properties of null (reading 'useState')") ||
        l.text.includes("Cannot read properties of null (reading 'useRef')")),
  );
  if (fatalErrors.length > 0) {
    console.error('FAIL: Fatal React errors detected:');
    fatalErrors.forEach((e) => console.error(`  - ${e.text.substring(0, 200)}`));
    exitCode = 1;
  }

  // Check for page-level uncaught errors
  if (errors.length > 0) {
    console.error('FAIL: Uncaught page errors:');
    errors.forEach((e) => console.error(`  - ${e.substring(0, 200)}`));
    exitCode = 1;
  }

  // Check that body has visible text (the app rendered something)
  const bodyText = await page.evaluate(
    () => document.body.innerText?.substring(0, 500) ?? '',
  );
  if (bodyText.trim().length === 0) {
    console.error('FAIL: No visible text rendered');
    exitCode = 1;
  } else {
    console.log(`Visible text preview: "${bodyText.substring(0, 100)}..."`);
  }

  // Take screenshot
  await page.screenshot({
    path: '/Users/elninja/Code/lomito/test-web-screenshot.png',
    fullPage: true,
  });
  console.log('Screenshot saved to test-web-screenshot.png');

  // Print warnings (non-fatal)
  const warnings = consoleLogs.filter((l) => l.type === 'warning');
  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    warnings.forEach((w) =>
      console.log(`  - ${w.text.substring(0, 150)}`),
    );
  }

  // Summary
  if (exitCode === 0) {
    console.log('\nPASS: Web app renders successfully');
  } else {
    console.log('\nFAIL: Web app has rendering issues');
  }
} catch (err) {
  console.error('Navigation error:', err.message);
  exitCode = 1;
} finally {
  await browser.close();
  process.exit(exitCode);
}
