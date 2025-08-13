const sortByColors = require('../scripts/color-sorting.js');
const fs = require('fs');
const path = require('path');
const { devices } = require('puppeteer');
const simpleIcons = require('simple-icons');
const { URL } = require('url');

const {
  getValue,
  hasClass,
  isDisabled,
  isHidden,
  isInViewport,
  isVisible,
  getAttribute,
  getTextContent,
} = require('./helpers.js');

jest.retryTimes(3);
jest.setTimeout(3000);

const COLOR_REGEX = /^#[A-F0-9]{6}$/;
const SVG_REGEX = /^<svg.*>.*<\/svg>$/;

const DEFAULT_DEVICE = {
  name: 'Desktop (785x600)',
  userAgent:
    'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.1.0; en-US) AppleWebKit/536.2+ (KHTML like Gecko) Version/7.2.1.0 Safari/536.2+',
  viewport: {
    width: 785,
    height: 600,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: false,
  },
};

const url = new URL('http://localhost:8080/');

beforeAll(() => {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR);
  }
});

describe.each([
  ['desktop', DEFAULT_DEVICE],
  ['mobile', devices['Nexus 7']],
])('General (%s)', (name, device) => {
  beforeEach(async () => {
    await page.emulate(device);
    await page.goto(url.href);
  });

  it('produces a screenshot', async () => {
    await page.screenshot({
      path: path.resolve(ARTIFACTS_DIR, `${name}.png`),
    });
  });

  it('displays the text "Simple Icons"', async () => {
    await expect(page).toMatch('Simple Icons');
  });

  it('has the search input in view on load', async () => {
    const $searchInput = await page.$('#search-input');
    expect(await isInViewport($searchInput)).toBeTruthy();
  });

  it('has the order controls in view on load', async () => {
    const $orderAlphabetically = await page.$('#order-alpha');
    expect(await isInViewport($orderAlphabetically)).toBeTruthy();

    const $orderByColor = await page.$('#order-color');
    expect(await isInViewport($orderByColor)).toBeTruthy();
  });

  // it('has the first grid item in view on load', async () => {
  //   const $firstGridItem = await page.$('.grid-item');
  //   expect(await isInViewport($firstGridItem)).toBeTruthy();
  // });

  it('hides the #copy-input element', async () => {
    const $copyInput = await page.$('#copy-input');
    expect(await isHidden($copyInput)).toBeTruthy();
  });

  afterAll(async () => {
    await page.emulate(DEFAULT_DEVICE);
  });
});

describe('External links', () => {
  beforeEach(async () => {
    await page.goto(url.href);
  });

  describe.each([
    'repository',
    'SimpleIcons',
    'Shields.io',
    'Legal disclaimer',
  ])(`is possible to click menu links`, (title) => {
    it(`is possible to click the link for ${title}`, async () => {
      await expect(page).toClick(`a[title="${title}"]`);
    });
  });
});

describe('Search', () => {
  beforeEach(async () => {
    await page.goto(url.href);
  });

  it('does not show the "order by relevance" button on load', async () => {
    const $orderByRelevance = await page.$('#order-relevance');
    expect(await isHidden($orderByRelevance)).toBeTruthy();
  });

  it('does not show the "clear search" button on load', async () => {
    const $searchClear = await page.$('#search-clear');
    expect(await isHidden($searchClear)).toBeTruthy();
  });

  it('does not show the "no results" message on load', async () => {
    const $gridItemIfEmpty = await page.$('.grid-item--if-empty');
    expect(await isHidden($gridItemIfEmpty)).toBeTruthy();
  });

  it('shows the "order by relevance" button on search', async () => {
    const $searchInput = await page.$('#search-input');
    await $searchInput.type('adobe');

    const $orderByRelevance = await page.$('#order-relevance');
    expect(await isVisible($orderByRelevance)).toBeTruthy();
  });

  it('shows the "clear search" button on search', async () => {
    const $searchInput = await page.$('#search-input');
    await $searchInput.type('adobe');

    const $searchClear = await page.$('#search-clear');
    expect(await isVisible($searchClear)).toBeTruthy();
  });

  it('enables ordering by relevance on search', async () => {
    const $searchInput = await page.$('#search-input');
    await $searchInput.type('adobe');

    const $body = await page.$('body');
    expect(await hasClass($body, 'order-by-relevance')).toBeTruthy();
  });

  it('does not show the "no results" message on search', async () => {
    const $gridItemIfEmpty = await page.$('.grid-item--if-empty');
    expect(await isHidden($gridItemIfEmpty)).toBeTruthy();
  });

  it('resets the search when clicking the "clear search" button', async () => {
    const $searchInput = await page.$('#search-input');
    await $searchInput.type('adobe');

    const $searchClear = await page.$('#search-clear');
    await $searchClear.click();

    expect(await getValue($searchInput)).toBe('');
    expect(await isHidden($searchClear)).toBeTruthy();
  });

  it.each([
    ['order-alpha', 'order-alphabetically'],
    ['order-color', 'order-by-color'],
  ])('switches back to "%s" when the search is removed', async (id, value) => {
    await page.click(`#${id}`);

    const $searchInput = await page.$('#search-input');
    await $searchInput.type('adobe');

    await $searchInput.click({ clickCount: 3 });
    await $searchInput.press('Backspace');

    const $body = await page.$('body');
    expect(await hasClass($body, 'order-by-relevance')).toBeFalsy();
    expect(await hasClass($body, value)).toBeTruthy();
  });

  it.each([
    ['order-alpha', 'order-alphabetically'],
    ['order-color', 'order-by-color'],
  ])('switches back to "%s" when search is cleared', async (id, value) => {
    await page.click(`#${id}`);

    const $searchInput = await page.$('#search-input');
    await $searchInput.type('adobe');

    const $searchClear = await page.$('#search-clear');
    await $searchClear.click();

    const $body = await page.$('body');
    expect(await hasClass($body, 'order-by-relevance')).toBeFalsy();
    expect(await hasClass($body, value)).toBeTruthy();
  });

  it('adds the search query to the URL', async () => {
    const query = 'amd';

    const $searchInput = await page.$('#search-input');
    await $searchInput.type(query, { delay: 100 });

    const url = page.url();
    expect(url).toMatch(`?q=${query}`);
  });

  it('loads the search query from the URL', async () => {
    const query = 'simple icons';
    await page.goto(`${url.href}?q=${query}`);

    const $searchInput = await page.$('#search-input');
    const searchInputValue = await getValue($searchInput);
    expect(searchInputValue).toEqual(query);

    const $searchClear = await page.$('#search-clear');
    expect(await isVisible($searchClear)).toBeTruthy();

    const $orderByRelevance = await page.$('#order-relevance');
    expect(await isVisible($orderByRelevance)).toBeTruthy();
  });

  it('shows the "no results" message if no brand was found', async () => {
    await page.type('#search-input', 'this is definitely not going to match');
    await page.screenshot({
      path: path.resolve(ARTIFACTS_DIR, 'desktop_no-search-results.png'),
    });

    const $gridItemIfEmpty = await page.$('.grid-item--if-empty');
    expect(await isVisible($gridItemIfEmpty)).toBeTruthy();
  });

  it('hides the "no results" message when the search is removed', async () => {
    const $searchInput = await page.$('#search-input');
    await $searchInput.type('this is definitely not going to match');

    await $searchInput.click({ clickCount: 3 });
    await $searchInput.press('Backspace');

    const $gridItemIfEmpty = await page.$('.grid-item--if-empty');
    expect(await isHidden($gridItemIfEmpty)).toBeTruthy();
  });
});

describe('Ordering', () => {
  const icons = Object.values(simpleIcons);
  const titles = icons.map((icon) => icon.title);
  const hexes = sortByColors(icons.map((icon) => icon.hex));

  beforeEach(async () => {
    await page.goto(url.href);
  });

  it('reloads ordering alphabetically', async () => {
    await expect(page).toClick('#order-alpha');

    await page.reload();

    const $body = await page.$('body');
    expect(await hasClass($body, 'order-alphabetically')).toBeTruthy();
  });

  it('reloads ordering by color', async () => {
    await expect(page).toClick('#order-color');

    await page.reload();

    const $body = await page.$('body');
    expect(await hasClass($body, 'order-by-color')).toBeTruthy();
  });

  it('orders grid items alphabetically', async () => {
    await expect(page).toClick('#order-alpha');

    const $gridItems = await page.$$('.grid-item');
    for (let i = 0; i < $gridItems.length; i++) {
      const $gridItem = $gridItems[i];
      const title = titles[i];
      await expect($gridItem).toMatch(title);
    }
  });

  it.skip('orders grid items by color', async () => {
    const $items = await page.$$('li.grid-item');
    for (let i = 0; i < $items.length; i++) {
      const $button = await $items[i].$('button.grid-item__color');

      const $text = await getAttribute($items[i], 'style');
      const $idx = parseInt($text.substring(14, $text.length));

      const $color = await getTextContent($button);
    }
  });
});

describe('Grid item', () => {
  beforeEach(async () => {
    const context = browser.defaultBrowserContext();
    await context._connection.send('Browser.grantPermissions', {
      origin: url.origin,
      permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
    });
  });

  beforeEach(async () => {
    await page.goto(url.href);
    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: ARTIFACTS_DIR,
    });
  });

  it('has the color value button enabled', async () => {
    const $previewButton = await page.$('button.copy-color');
    expect(await isDisabled($previewButton)).toBeFalsy();
  });
});

describe('JavaScript disabled', () => {
  beforeEach(async () => {
    page.setJavaScriptEnabled(false);
    await page.goto(url.href);
  });

  it('produces a screenshot', async () => {
    await page.screenshot({
      path: path.resolve(ARTIFACTS_DIR, 'desktop_js-disabled.png'),
    });
  });

  it('does not show the "order by relevance" button', async () => {
    const $orderByRelevance = await page.$('#order-relevance');
    expect(await isHidden($orderByRelevance)).toBeTruthy();
  });

  it('does not show the "clear search" button on load', async () => {
    const $searchClear = await page.$('#search-clear');
    expect(await isHidden($searchClear)).toBeTruthy();
  });

  it('has disabled ordering buttons', async () => {
    const $orderAlphabetically = await page.$('#order-alpha');
    expect(await isDisabled($orderAlphabetically)).toBeTruthy();

    const $orderByColor = await page.$('#order-color');
    expect(await isDisabled($orderByColor)).toBeTruthy();

    const $orderByRelevance = await page.$('#order-relevance');
    expect(await isDisabled($orderByRelevance)).toBeTruthy();
  });

  it('has the color value button disabled', async () => {
    const $colorButton = await page.$('button.copy-color');
    expect(await isDisabled($colorButton)).toBeTruthy();
  });

  it('has the SVG preview button disabled', async () => {
    const $previewButton = await page.$('button.copy-svg');
    expect(await isDisabled($previewButton)).toBeTruthy();
  });

  afterAll(async () => {
    page.setJavaScriptEnabled(true);
  });
});
