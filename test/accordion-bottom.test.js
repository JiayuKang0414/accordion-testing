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

test('moves the expanded-state line below the expanded content', () => {
  assert.match(componentSource, /aria-expanded='true'/);
  assert.match(componentSource, /border-top-color: transparent/);
  assert.match(
    componentSource,
    /aria-expanded='true'] \+ \.accordion-body-wrapper/,
  );
  assert.match(componentSource, /inset 0 -2px 0 #e21833/);
});

test('uses the UMD yellow indicator in the dark theme', () => {
  assert.match(componentSource, /:host\(\[data-theme='dark'\]\)/);
  assert.match(componentSource, /inset 0 -2px 0 #FFD200/);
});

test('shows the title-bottom hover and focus indicator when collapsed', () => {
  assert.match(
    componentSource,
    /\.accordion-headline\[aria-expanded='false'\]:hover,/,
  );
  assert.match(
    componentSource,
    /\.accordion-headline\[aria-expanded='false'\]:focus \{/,
  );
  assert.doesNotMatch(
    componentSource,
    /aria-expanded='true'\]:hover \+ \.accordion-body-wrapper/,
  );
});

test('QA page includes current and new accordion comparisons', () => {
  assert.match(qaPage, /Current component: top indicator/);
  assert.match(qaPage, /New component: bottom indicator/);
  assert.match(qaPage, /<umd-element-accordion-item-bottom/);
});
