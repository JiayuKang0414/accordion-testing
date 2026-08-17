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
      focused: button.matches(':focus'),
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

const hoverHeadline = async (index) => {
  const host = page.locator('umd-element-accordion-item-bottom').nth(index);
  await host.scrollIntoViewIfNeeded();
  await host.locator('.accordion-headline').hover();
  await page.waitForTimeout(150);
};

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

await hoverHeadline(0);
const lightExpandedHoverState = await readState(
  'umd-element-accordion-item-bottom',
  0,
);
assert.equal(lightExpandedHoverState.headlineBoxShadow, 'none');
assert.match(lightExpandedHoverState.bodyWrapperBoxShadow, /226, 24, 51/);

await page.mouse.move(0, 0);
await page.waitForTimeout(150);
const lightAfterHoverState = await readState(
  'umd-element-accordion-item-bottom',
  0,
);
assert.equal(lightAfterHoverState.headlineBoxShadow, 'none');
assert.match(lightAfterHoverState.bodyWrapperBoxShadow, /226, 24, 51/);

await hoverHeadline(2);
const lightClosedHoverState = await readState(
  'umd-element-accordion-item-bottom',
  2,
);
assert.equal(lightClosedHoverState.expanded, 'false');
assert.equal(lightClosedHoverState.borderTopColor, 'rgba(0, 0, 0, 0)');
assert.match(lightClosedHoverState.headlineBoxShadow, /226, 24, 51/);
assert.equal(lightClosedHoverState.bodyWrapperBoxShadow, 'none');

await page.mouse.move(0, 0);
await page.waitForTimeout(150);

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

await page
  .locator('umd-element-accordion-item-bottom')
  .nth(1)
  .locator('.accordion-headline')
  .click();
await page.mouse.move(0, 0);
await page.waitForTimeout(600);

const lightCollapsedFocusedState = await readState(
  'umd-element-accordion-item-bottom',
  1,
);
assert.equal(lightCollapsedFocusedState.expanded, 'false');
assert.equal(lightCollapsedFocusedState.focused, true);
assert.equal(
  lightCollapsedFocusedState.borderTopColor,
  'rgba(0, 0, 0, 0)',
);
assert.match(
  lightCollapsedFocusedState.headlineBoxShadow,
  /226, 24, 51/,
);

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
assert.match(darkState.bodyWrapperBoxShadow, /255, 210, 0/);
assert.equal(darkState.bodyTextColor, 'rgb(255, 255, 255)');

await hoverHeadline(5);
const darkExpandedHoverState = await readState(
  'umd-element-accordion-item-bottom',
  5,
);
assert.equal(darkExpandedHoverState.headlineBoxShadow, 'none');
assert.match(darkExpandedHoverState.bodyWrapperBoxShadow, /255, 210, 0/);

await page.mouse.move(0, 0);
await page.waitForTimeout(150);
const darkAfterHoverState = await readState(
  'umd-element-accordion-item-bottom',
  5,
);
assert.equal(darkAfterHoverState.headlineBoxShadow, 'none');
assert.match(darkAfterHoverState.bodyWrapperBoxShadow, /255, 210, 0/);

await hoverHeadline(6);
const darkClosedHoverState = await readState(
  'umd-element-accordion-item-bottom',
  6,
);
assert.equal(darkClosedHoverState.expanded, 'false');
assert.equal(darkClosedHoverState.borderTopColor, 'rgba(0, 0, 0, 0)');
assert.match(darkClosedHoverState.headlineBoxShadow, /255, 210, 0/);
assert.equal(darkClosedHoverState.bodyWrapperBoxShadow, 'none');

await page.mouse.move(0, 0);
await page.waitForTimeout(150);

await page.evaluate(() => {
  const host = document.querySelectorAll('umd-element-accordion-item-bottom')[6];
  host
    .querySelector('umd-element-accordion-item')
    .shadowRoot.querySelector('.accordion-headline')
    .click();
});
await page.waitForTimeout(600);

const darkClickedState = await readState(
  'umd-element-accordion-item-bottom',
  6,
);
assert.equal(darkClickedState.expanded, 'true');
assert.equal(darkClickedState.headlineBoxShadow, 'none');
assert.match(darkClickedState.bodyWrapperBoxShadow, /255, 210, 0/);
assert.equal(darkClickedState.bodyTextColor, 'rgb(255, 255, 255)');

await page
  .locator('umd-element-accordion-item-bottom')
  .nth(6)
  .locator('.accordion-headline')
  .click();
await page.mouse.move(0, 0);
await page.waitForTimeout(600);

const darkCollapsedFocusedState = await readState(
  'umd-element-accordion-item-bottom',
  6,
);
assert.equal(darkCollapsedFocusedState.expanded, 'false');
assert.equal(darkCollapsedFocusedState.focused, true);
assert.equal(
  darkCollapsedFocusedState.borderTopColor,
  'rgba(0, 0, 0, 0)',
);
assert.match(
  darkCollapsedFocusedState.headlineBoxShadow,
  /255, 210, 0/,
);
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
  lightExpandedHover: lightExpandedHoverState,
  lightAfterHover: lightAfterHoverState,
  lightClosedHover: lightClosedHoverState,
  clicked: clickedState,
  lightCollapsedFocused: lightCollapsedFocusedState,
  dark: darkState,
  darkExpandedHover: darkExpandedHoverState,
  darkAfterHover: darkAfterHoverState,
  darkClosedHover: darkClosedHoverState,
  darkClicked: darkClickedState,
  darkCollapsedFocused: darkCollapsedFocusedState,
  mobileOverflow: hasHorizontalOverflow,
}, null, 2));

await browser.close();
