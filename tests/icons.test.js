/**
 * @jest-environment jsdom
 */

import { createListElement, imageCache } from '../public/scripts/icons.js';

describe('Icons', () => {
  const originalFetch = global.fetch;
  const originalCreateObjectURL = global.URL.createObjectURL;

  beforeAll(() => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      blob: () => Promise.resolve(new Blob(['<svg></svg>'])),
    }));
    global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
  });

  afterAll(() => {
    global.fetch = originalFetch;
    global.URL.createObjectURL = originalCreateObjectURL;
    jest.clearAllMocks();
  });

  it('should create an element with the correct structure and content', () => {
    const icon = {
      badgeEncodedTitle: 'Test-Title',
      shortHex: '123456',
      slug: 'test-icon',
      superLight: false,
      guidelines: 'https://example.com/guidelines',
      title: 'Test Icon',
      license: { type: 'MIT', url: 'https://example.com/license' },
      indexByColor: '1',
      indexByAlpha: 1,
      normalizedName: 'test-icon',
    };

    const element = createListElement(icon);

    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.getAttribute('data-brand')).toBe('test-icon');
    expect(element.querySelector('.grid-item__title').textContent).toBe(
      icon.title,
    );
    expect(element.querySelector('.icon-preview').src).toBe(
      'http://localhost/test-file-stub',
    );
    expect(element.querySelector('.grid-item__link.link-button').href).toBe(
      icon.guidelines,
    );
    expect(element.querySelector('.grid-item__link.icon-legal').href).toBe(
      icon.license.url,
    );
  });

  it('should use cached image if it exists', () => {
    const icon = {
      badgeEncodedTitle: 'Cached-Icon',
      shortHex: '654321',
      slug: 'cached-icon',
      superLight: true,
      guidelines: '',
      title: 'Cached Icon',
      license: null,
      indexByColor: '2',
      normalizedName: 'cached-icon',
    };
    const cachedUrl = 'https://cached-image-url.test/';

    jest.spyOn(imageCache, 'get').mockReturnValueOnce(cachedUrl);

    const element = createListElement(icon);

    expect(imageCache.get).toHaveBeenCalledWith(
      'https://img.shields.io/badge/Cached-Icon-654321?logo=cached-icon&logoColor=000&style=for-the-badge',
    );
    expect(element.querySelector('.icon-preview').src).toBe(cachedUrl);
  });

  it('should fetch and set a new image if not cached', async () => {
    const icon = {
      badgeEncodedTitle: 'New-Icon',
      shortHex: 'abcdef',
      slug: 'new-icon',
      superLight: true,
      guidelines: '',
      title: 'New Icon',
      license: null,
      indexByColor: '3',
      normalizedName: 'new-icon',
    };

    let resolveFetchPromise;
    const fetchPromise = new Promise((resolve) => {
      resolveFetchPromise = resolve;
    });

    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      blob: () => fetchPromise,
    }));

    jest.spyOn(imageCache, 'get').mockReturnValueOnce(null);
    jest.spyOn(imageCache, 'set');

    const element = createListElement(icon);
    resolveFetchPromise(new Blob());

    await fetchPromise;
    await new Promise((r) => setTimeout(r, 0));

    const expectedUrl = 'https://img.shields.io/badge/New-Icon-abcdef?logo=new-icon&logoColor=000&style=for-the-badge';

    expect(imageCache.get).toHaveBeenCalledWith(expectedUrl);
    expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
    expect(imageCache.set).toHaveBeenCalledWith(expectedUrl, 'mock-object-url');
    expect(element.querySelector('.icon-preview').getAttribute('src')).toBe('mock-object-url');
  });

  it('should handle missing guidelines and license gracefully', () => {
    const icon = {
      badgeEncodedTitle: 'Minimal-Icon',
      shortHex: '000000',
      slug: 'minimal-icon',
      superLight: false,
      guidelines: '',
      title: 'Minimal Icon',
      license: null,
      indexByColor: '4',
      normalizedName: 'minimal-icon',
    };

    const element = createListElement(icon);

    expect(element.querySelector('.grid-item__link.link-button')).toBeNull();
    expect(element.querySelector('.grid-item__link.icon-legal')).toBeNull();
  });
});
