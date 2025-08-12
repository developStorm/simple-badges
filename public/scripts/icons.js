import EllipseLoader from '/public/images/Ellipsis@1x-1.0s-200px-200px.svg';

export const imageCache = new Map();

export function createListElement(icon) {
  const baseUrl = 'https://img.shields.io/badge/';
  const badgeUrl = new URL(`${icon.badgeEncodedTitle}-${icon.shortHex}`, baseUrl);
  badgeUrl.searchParams.set('logo', icon.slug);
  badgeUrl.searchParams.set('logoColor', icon.superLight ? '000' : 'fff');
  badgeUrl.searchParams.set('style', 'for-the-badge');

  const remoteImageUrl = badgeUrl.href;
  const cachedImage = imageCache.get(remoteImageUrl);
  const initialSrc = cachedImage || EllipseLoader;

  const guidelinesHtml = icon.guidelines
    ? `
    <a class="grid-item__link link-button"
       title="${icon.title} guidelines"
       href="${icon.guidelines}"
       rel="noopener"
       target="_blank">
       Brand Guidelines
    </a>
  `
    : '';

  const licenseHtml = icon.license
    ? `
    <a class="grid-item__link link-button icon-legal"
       title="${icon.title} icon license"
       href="${icon.license.url}"
       rel="noopener"
       target="_blank">
       ${icon.license.type}
    </a>
  `
    : '';

  const listItemHtml = `
    <div class="grid-item"
      style="--order-color: ${icon.indexByColor};"
      data-brand="${icon.normalizedName}"
      data-title="${icon.title}"
      data-encoded_title="${icon.badgeEncodedTitle}"
      data-color="${icon.shortHex}"
      data-logo_color="${icon.superLight ? '000' : 'fff'}"
      data-slug="${icon.slug}">
      
      <div class="grid-item__row mv-2 fg-2">
        <button class="grid-item__preview copy-button copy-svg" 
          title="${ icon.title } SVG"
          data-style="for-the-badge"
        >
        <img class="icon-preview"
          style="height: 28px;"
          src="${initialSrc}"
          loading="lazy"
          alt="${icon.badgeEncodedTitle} badge">
        </button>
      </div>

      <div class="grid-item__row">
        ${guidelinesHtml}
        ${licenseHtml}
        <h2 class="grid-item__title">${icon.title}</h2>
      </div>

      <div class="grid-item__footer">
        <button class="grid-item__color copy-button copy-color"
                title="${icon.title} Flat Badge"
                data-style="flat">
          Flat
        </button>
        <button class="grid-item__color copy-button copy-color"
                title="${icon.title} Square Badge"
                data-style="flat-square">
          Square
        </button>
        <button class="grid-item__color copy-button copy-color"
                title="${icon.title} Plastic Badge"
                data-style="plastic">
          Plastic
        </button>
      </div>
    </div>
  `;

  const $temp = document.createElement('div');
  $temp.innerHTML = listItemHtml.trim();

  const $image = $temp.querySelector('.icon-preview');

  if (!cachedImage) {
    fetch(remoteImageUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.blob();
    })
    .then(imageBlob => {
      const objectUrl = URL.createObjectURL(imageBlob);
      imageCache.set(remoteImageUrl, objectUrl);
      $image.src = objectUrl;
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
  }

  return $temp.firstElementChild;
}
