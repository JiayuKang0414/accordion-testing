import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const browserErrors = [];

page.on('console', (message) => {
  if (message.type() === 'error') browserErrors.push(message.text());
});
page.on('pageerror', (error) => browserErrors.push(error.message));

await page.goto('http://127.0.0.1:8010/qa/accordion-bottom.html', {
  waitUntil: 'networkidle',
});

await page.locator('#new').scrollIntoViewIfNeeded();
await page.waitForFunction(() => {
  const items = Array.from(
    document.querySelectorAll('umd-element-accordion-item-bottom'),
  );

  return items.slice(0, 3).every((item) => {
    const base = item.querySelector('umd-element-accordion-item');
    return Boolean(base?.shadowRoot?.querySelector('.accordion-headline'));
  });
});
await page.waitForTimeout(600);

const readState = (selector, index = 0) => page.evaluate(
  ({ selector, index }) => {
    const host = document.querySelectorAll(selector)[index];
    const base = host.matches('umd-element-accordion-item')
      ? host
      : host.querySelector('umd-element-accordion-item');
    const button = base.shadowRoot.querySelector('.accordion-headline');
    const bodyWrapper = base.shadowRoot.querySelector('.accordion-body-wrapper');
    const style = getComputedStyle(button);
    const bodyWrapperStyle = getComputedStyle(bodyWrapper);

    return {
      expanded: button.getAttribute('aria-expanded'),
      borderTopColor: style.borderTopColor,
      borderTopWidth: style.borderTopWidth,
      headlineBoxShadow: style.boxShadow,
      bodyWrapperBoxShadow: bodyWrapperStyle.boxShadow,
      bodyTextColor: getComputedStyle(
        base.querySelector('[slot="text"] p')
          ?? base.querySelector('[slot="text"]'),
      ).color,
      hasOverride: Boolean(
        base.shadowRoot.querySelector('style[data-accordion-bottom-indicator]'),
      ),
    };
  },
  { selector, index },
);

const currentState = await readState('#current umd-element-accordion-item');
const newOpenState = await readState('umd-element-accordion-item-bottom', 0);

assert.equal(currentState.expanded, 'true');
assert.equal(currentState.borderTopWidth, '2px');
assert.match(currentState.borderTopColor, /226, 24, 51/);

assert.equal(newOpenState.expanded, 'true');
assert.equal(newOpenState.borderTopWidth, '2px');
assert.equal(newOpenState.borderTopColor, 'rgba(0, 0, 0, 0)');
assert.equal(newOpenState.headlineBoxShadow, 'none');
assert.match(newOpenState.bodyWrapperBoxShadow, /226, 24, 51/);
assert.equal(newOpenState.hasOverride, true);

await page.evaluate(() => {
  const host = document.querySelectorAll('umd-element-accordion-item-bottom')[1];
  host
    .querySelector('umd-element-accordion-item')
    .shadowRoot.querySelector('.accordion-headline')
    .click();
});
await page.waitForTimeout(600);

const clickedState = await readState('umd-element-accordion-item-bottom', 1);
assert.equal(clickedState.expanded, 'true');
assert.equal(clickedState.headlineBoxShadow, 'none');
assert.match(clickedState.bodyWrapperBoxShadow, /226, 24, 51/);

await page.locator('#dark-theme').scrollIntoViewIfNeeded();
await page.waitForFunction(() => {
  const host = document.querySelectorAll('umd-element-accordion-item-bottom')[5];
  return Boolean(
    host
      ?.querySelector('umd-element-accordion-item')
      ?.shadowRoot?.querySelector('style[data-accordion-bottom-indicator]'),
  );
});
await page.waitForTimeout(600);

const darkState = await readState('umd-element-accordion-item-bottom', 5);
assert.equal(darkState.expanded, 'true');
assert.equal(darkState.headlineBoxShadow, 'none');
assert.match(darkState.bodyWrapperBoxShadow, /226, 24, 51/);
assert.equal(darkState.bodyTextColor, 'rgb(255, 255, 255)');
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);

await page.screenshot({
  path: 'qa/accordion-bottom-desktop.png',
  fullPage: true,
});

await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://127.0.0.1:8010/qa/accordion-bottom.html', {
  waitUntil: 'networkidle',
});
await page.locator('#new').scrollIntoViewIfNeeded();
await page.waitForFunction(() => {
  const host = document.querySelector('umd-element-accordion-item-bottom');
  return Boolean(
    host
      ?.querySelector('umd-element-accordion-item')
      ?.shadowRoot?.querySelector('style[data-accordion-bottom-indicator]'),
  );
});

const hasHorizontalOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth,
);
assert.equal(hasHorizontalOverflow, false);

await page.locator('#dark-theme').scrollIntoViewIfNeeded();
await page.waitForFunction(() => {
  const host = document.querySelectorAll('umd-element-accordion-item-bottom')[5];
  return Boolean(
    host
      ?.querySelector('umd-element-accordion-item')
      ?.shadowRoot?.querySelector('style[data-accordion-bottom-indicator]'),
  );
});
await page.waitForTimeout(600);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);

await page.screenshot({
  path: 'qa/accordion-bottom-mobile.png',
  fullPage: true,
});

assert.deepEqual(browserErrors, []);

console.log(JSON.stringify({
  current: currentState,
  bottomIndicator: newOpenState,
  clicked: clickedState,
  dark: darkState,
  mobileOverflow: hasHorizontalOverflow,
}, null, 2));

await browser.close();
