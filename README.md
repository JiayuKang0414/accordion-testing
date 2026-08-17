# UMD Accordion Bottom Indicator

This project adds `umd-element-accordion-item-bottom`, a small variant of the
current UMD `umd-element-accordion-item`. It keeps the existing slots,
attributes, animation, keyboard behavior, and ARIA state, while moving the red
open-state line from the top of the trigger to the bottom of the expanded
content. The indicator is UMD red in the light theme and UMD yellow in the dark
theme. Collapsed titles show the indicator at the bottom of the title on hover
and focus. Expanded titles do not add a hover line; their indicator remains
below the expanded content.

## Run the QA page

```bash
npm start
```

Open <http://127.0.0.1:8010/>. The page compares the current component with the
new variant and includes light, dark, initially open, and initially closed
cases.

## Usage

Load the UMD styles and component bundle first, then load
`src/accordion-bottom.js` as a module:

```html
<link rel="stylesheet" href="./public/umd-styles.min.css">
<script src="./public/umd-components.js"></script>
<script type="module" src="./src/accordion-bottom.js"></script>

<umd-element-accordion-item-bottom data-visual-open="true">
  <p slot="headline">Accordion headline</p>
  <div slot="text">
    <p>Accordion content.</p>
  </div>
</umd-element-accordion-item-bottom>
```

Supported forwarded attributes:

- `data-theme="light|dark"`
- `data-visual-open="true|false"`
- `resize="true"`

The vendored UMD assets come from the supplied `UMD-Design-System` repository.
The full QA page structure, component API, spacing, and critical CSS come from
the supplied `design-system-page-builder-codex` repository.
