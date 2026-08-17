const COMPONENT_TAG = 'umd-element-accordion-item-bottom';
const BASE_COMPONENT_TAG = 'umd-element-accordion-item';
const FORWARDED_ATTRIBUTES = ['data-theme', 'data-visual-open', 'resize'];
const OVERRIDE_MARKER = 'data-accordion-bottom-indicator';
const LIGHT_DOM_STYLE_MARKER = 'data-accordion-bottom-light-dom';

const bottomIndicatorStyles = `
  .accordion-headline[aria-expanded='true'],
  .accordion-headline[aria-expanded='true']:hover,
  .accordion-headline[aria-expanded='true']:focus {
    border-top-color: transparent !important;
    box-shadow: none;
    transition: background 0.5s, color 0.5s, padding 0.5s;
  }

  .accordion-headline[aria-expanded='true'] + .accordion-body-wrapper {
    box-shadow: inset 0 -2px 0 #e21833;
  }

  .accordion-headline[aria-expanded='false']:hover,
  .accordion-headline[aria-expanded='false']:focus {
    border-top-color: transparent !important;
    box-shadow: inset 0 -2px 0 #e21833;
  }

  :host([data-theme='dark'])
    .accordion-headline[aria-expanded='true'] + .accordion-body-wrapper {
    box-shadow: inset 0 -2px 0 #FFD200;
  }

  :host([data-theme='dark'])
    .accordion-headline[aria-expanded='false']:hover,
  :host([data-theme='dark'])
    .accordion-headline[aria-expanded='false']:focus {
    box-shadow: inset 0 -2px 0 #FFD200;
  }
`;

/**
 * A thin variant wrapper around the current UMD accordion item.
 *
 * It preserves the base component's slots, attributes, animation, keyboard
 * behavior, and ARIA state. The only visual change is the location of the
 * open-state indicator.
 */
export class UmdElementAccordionItemBottom extends HTMLElement {
  static get observedAttributes() {
    return FORWARDED_ATTRIBUTES;
  }

  connectedCallback() {
    if (!this.baseAccordion) {
      this.initializeBaseAccordion();
    }

    this.observeVisibility();
  }

  disconnectedCallback() {
    this.visibilityObserver?.disconnect();
    this.visibilityObserver = null;

    if (this.retryFrame) {
      cancelAnimationFrame(this.retryFrame);
      this.retryFrame = null;
    }
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (!this.baseAccordion) return;

    if (newValue === null) {
      this.baseAccordion.removeAttribute(name);
    } else {
      this.baseAccordion.setAttribute(name, newValue);
    }
  }

  initializeBaseAccordion() {
    const sourceContent = Array.from(this.childNodes);
    const baseAccordion = document.createElement(BASE_COMPONENT_TAG);

    FORWARDED_ATTRIBUTES.forEach((name) => {
      if (this.hasAttribute(name)) {
        baseAccordion.setAttribute(name, this.getAttribute(name) ?? '');
      }
    });

    sourceContent.forEach((node) => baseAccordion.appendChild(node));
    this.replaceChildren(baseAccordion);
    this.baseAccordion = baseAccordion;
  }

  observeVisibility() {
    if (this.visibilityObserver) return;

    if (!('IntersectionObserver' in window)) {
      this.installOverrideWhenReady();
      return;
    }

    this.visibilityObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;

      this.visibilityObserver.disconnect();
      this.visibilityObserver = null;
      this.installOverrideWhenReady();
    });

    this.visibilityObserver.observe(this);
  }

  async installOverrideWhenReady() {
    await customElements.whenDefined(BASE_COMPONENT_TAG);
    this.installOverride();
  }

  installOverride() {
    if (!this.isConnected || !this.baseAccordion) return;

    const shadowRoot = this.baseAccordion.shadowRoot;

    if (!shadowRoot) {
      this.retryFrame = requestAnimationFrame(() => this.installOverride());
      return;
    }

    if (shadowRoot.querySelector(`style[${OVERRIDE_MARKER}]`)) return;

    const style = document.createElement('style');
    style.setAttribute(OVERRIDE_MARKER, '');
    style.textContent = bottomIndicatorStyles;
    shadowRoot.appendChild(style);
    this.retryFrame = null;
  }
}

if (!document.head.querySelector(`style[${LIGHT_DOM_STYLE_MARKER}]`)) {
  const lightDomStyles = document.createElement('style');
  lightDomStyles.setAttribute(LIGHT_DOM_STYLE_MARKER, '');
  lightDomStyles.textContent = `
    ${COMPONENT_TAG} {
      display: block;
    }

    ${COMPONENT_TAG}[data-theme='dark'] [slot='text'],
    ${COMPONENT_TAG}[data-theme='dark'] [slot='text'] * {
      color: #ffffff;
    }
  `;
  document.head.appendChild(lightDomStyles);
}

if (!customElements.get(COMPONENT_TAG)) {
  customElements.define(COMPONENT_TAG, UmdElementAccordionItemBottom);
}
