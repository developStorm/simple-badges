import EllipseLoader from '/public/images/Ellipsis@1x-1.0s-200px-200px.svg';
import { loadSvgSprite } from './sprites.js';

const intersectingElements = new Set();
const fetchingPromises = new Map();
const loadedSprites = new Set();

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(async ({ target: $listItem, isIntersecting }) => {
    const $image = $listItem.querySelector('.icon-preview');
    const $previewContainer = $listItem.querySelector('.grid-item__preview');
    const slug = $listItem.dataset.slug;
    const chunkFile = $image.dataset.chunk;

    if (!isIntersecting) {
      intersectingElements.delete($listItem);
      return;
    }

    if (loadedSprites.has(chunkFile)) {
      $previewContainer.innerHTML = '';
      renderIcon($previewContainer, slug);
      observer.unobserve($listItem);
      return;
    }

    intersectingElements.add($listItem);

    if (fetchingPromises.has(chunkFile)) {
      fetchingPromises.get(chunkFile).then(() => {
        if (intersectingElements.has($listItem)) {
          $previewContainer.innerHTML = '';
          renderIcon($previewContainer, slug);
        }
        observer.unobserve($listItem);
      });

      return;
    }

    fetchingPromises.set(
      chunkFile,
      loadSvgSprite(`/public/data/${chunkFile}`)
        .then(data => {
          loadedSprites.add(chunkFile);
          $previewContainer.innerHTML = '';
          renderIcon($previewContainer, slug);
      }),
    )
  });
}, { rootMargin: '0px 0px 100px 0px' });

export function createListElement(icon) {
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

  const iconPreview = loadedSprites.has(icon.chunkFile)
    ? `
    <svg class="icon-preview" height="28"><use href="#${icon.slug}"></use></svg>
    `
    : `
    <img class="icon-preview"
      src="${EllipseLoader}"
      data-chunk="${icon.chunkFile}"
      loading="lazy"
      alt="${icon.title} badge"
      style="height: 28px;">
    `;

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
         ${iconPreview}
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
  const $listItem = $temp.firstElementChild;

  if (!loadedSprites.has(icon.chunkFile)) {
    observer.observe($listItem);
  }

  return $listItem;
}
