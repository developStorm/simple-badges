/**
 * @jest-environment jsdom
 */

const {
  hideElement,
  showElement,
  addClass,
  removeClass,
  getColumnsCount,
} = require('../public/scripts/dom-utils.js');

const $el = {
  classList: {
    add: jest.fn().mockName('$el.classList.add'),
    remove: jest.fn().mockName('$el.classList.remove'),
    toggle: jest.fn().mockName('$el.classList.toggle'),
  },
  removeAttribute: jest.fn().mockName('$el.removeAttribute'),
  setAttribute: jest.fn().mockName('$el.setAttribute'),
};

describe('::hideElement', () => {
  beforeEach(() => {
    $el.classList.add.mockReset();
    $el.setAttribute.mockReset();
  });

  it('adds the .hidden class and the aria-hidden attribute', () => {
    hideElement($el);
    expect($el.classList.add).toHaveBeenCalledWith('hidden');
    expect($el.setAttribute).toHaveBeenCalledWith('aria-hidden', 'true');
  });
});

describe('::showElement', () => {
  beforeEach(() => {
    $el.classList.remove.mockReset();
    $el.removeAttribute.mockReset();
  });

  it('removes the .hidden class and the aria-hidden attribute', () => {
    showElement($el);
    expect($el.classList.remove).toHaveBeenCalledWith('hidden');
    expect($el.removeAttribute).toHaveBeenCalledWith('aria-hidden');
  });
});

describe('::removeClass', () => {
  beforeEach(() => {
    $el.classList.remove.mockReset();
  });

  it('removes a CSS class from an element', () => {
    removeClass($el, 'last__button');
    expect($el.classList.remove).toHaveBeenCalledWith('last__button');
  });
});

describe('::addClass', () => {
  beforeEach(() => {
    $el.classList.add.mockReset();
  });

  it('adds a CSS class to an element', () => {
    addClass($el, 'last__button');
    expect($el.classList.add).toHaveBeenCalledWith('last__button');
  });
});

describe('getColumnsCount', () => {
  const defaultFontSize = 16;
  const defaultWidthRem = 13.5;
  const defaultGapRem = 0.75;
  let getComputedStyleSpy;

  beforeEach(() => {
    getComputedStyleSpy = jest.spyOn(window, 'getComputedStyle');
    mockContainerStyles(defaultWidthRem, defaultGapRem);
  });

  afterEach(() => {
    getComputedStyleSpy.mockRestore();
  });

  function mockContainerStyles(widthRem, gapRem) {
    getComputedStyleSpy.mockImplementation((element) => {
      if (element === document.documentElement) {
        return { fontSize: `${defaultFontSize}px` };
      }

      return {
        getPropertyValue: (name) => {
          if (name === '--grid-width') return String(widthRem);
          if (name === '--grid-gap') return String(gapRem);
          return '';
        },
      };
    });
  }

  it('calculates with defaults when CSS variables are missing', () => {
    mockContainerStyles('', '');
    const container = { clientWidth: 1000 };
    const cols = getColumnsCount(container);

    const defaultMinWidth = 13.5 * defaultFontSize;
    const defaultGap = 0.75 * defaultFontSize;
    const defaultCols = Math.floor(
      (container.clientWidth + defaultGap) / (defaultMinWidth + defaultGap),
    );

    expect(cols).toBe(defaultCols);
  });

  it('uses provided CSS variables', () => {
    const container = { clientWidth: 800 };
    const widthRem = 10;
    const gapRem = 1;
    const minWidthPx = widthRem * defaultFontSize;
    const gapPx = gapRem * defaultFontSize;
    const expectedCols = Math.floor(
      (container.clientWidth + gapPx) / (minWidthPx + gapPx),
    );

    mockContainerStyles(widthRem, gapRem);
    const cols = getColumnsCount(container);

    expect(cols).toBe(expectedCols);
  });

  it('returns at least 1 for small widths', () => {
    const container = { clientWidth: 10 };
    expect(getColumnsCount(container)).toBe(1);
  });

  it('returns at least 1 for zero width', () => {
    const container = { clientWidth: 0 };
    expect(getColumnsCount(container)).toBe(1);
  });

  it('returns at least 1 for negative width', () => {
    const container = { clientWidth: -10 };
    expect(getColumnsCount(container)).toBe(1);
  });
});
