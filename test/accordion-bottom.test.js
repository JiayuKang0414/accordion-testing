import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const componentSource = await readFile(
  new URL('../src/accordion-bottom.js', import.meta.url),
  'utf8',
);
const qaPage = await readFile(
  new URL('../qa/accordion-bottom.html', import.meta.url),
  'utf8',
);

test('registers the bottom-indicator accordion custom element', () => {
  assert.match(
    componentSource,
    /umd-element-accordion-item-bottom/,
  );
  assert.match(componentSource, /customElements\.define/);
});

test('moves only the expanded-state line to the bottom edge', () => {
  assert.match(componentSource, /aria-expanded='true'/);
  assert.match(componentSource, /border-top-color: transparent/);
  assert.match(componentSource, /inset 0 -2px 0 #e21833/);
});

test('QA page includes current and new accordion comparisons', () => {
  assert.match(qaPage, /Current component: top indicator/);
  assert.match(qaPage, /New component: bottom indicator/);
  assert.match(qaPage, /<umd-element-accordion-item-bottom/);
});

