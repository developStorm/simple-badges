import * as simpleIcons from 'simple-icons';
import getRelativeLuminance from 'get-relative-luminance';
import sortByColors from './color-sorting.js';
import { normalizeSearchTerm } from './utils.js';

const icons = Object.values(simpleIcons);
const sortedHexes = sortByColors(icons.map((icon) => icon.hex));

export const processedIcons = prepareIcons(icons);

export function createListElement(icon) {
  const li = document.createElement('li');
  li.className = 'grid-item';
  li.style.setProperty('--order-color', icon.indexByColor);
  li.dataset.brand = icon.normalizedName;
  li.dataset.title = icon.title;
  li.dataset.encoded_title = icon.badgeEncodedTitle;
  li.dataset.color = icon.shortHex;
  li.dataset.logo_color = icon.superLight ? '000' : 'fff';
  li.dataset.slug = icon.slug;

  const row = document.createElement('div');
  row.className = 'grid-item__row mv-2 fg-2';

  const previewButton = document.createElement('button');
  previewButton.className = 'grid-item__preview copy-button copy-svg';
  previewButton.title = `${ icon.title } SVG`;
  // previewButton.disabled = true;

  const img = document.createElement('img');
  img.className = 'icon-preview';
  img.src = `https://img.shields.io/badge/${ icon.badgeEncodedTitle }-${ icon.shortHex }?logo=${ icon.slug }&logoColor=${ icon.superLight
    ? '000'
    : 'fff' }&style=for-the-badge`;
  img.loading = 'lazy';
  img.alt = `${ icon.title } badge`;

  previewButton.appendChild(img);
  row.appendChild(previewButton);
  li.appendChild(row);

  const secondRow = document.createElement('div');
  secondRow.className = 'grid-item__row';

  if (icon.guidelines) {
    const linkGuidelines = document.createElement('a');
    linkGuidelines.className = 'grid-item__link link-button';
    linkGuidelines.title = `${ icon.title } guidelines`;
    linkGuidelines.href = icon.guidelines;
    linkGuidelines.rel = 'noopener';
    linkGuidelines.target = '_blank';
    linkGuidelines.textContent = 'Brand Guidelines';
    secondRow.appendChild(linkGuidelines);
  }

  if (icon.license) {
    const linkLicense = document.createElement('a');
    linkLicense.className = 'grid-item__link link-button icon-legal';
    linkLicense.title = `${ icon.title } icon license`;
    linkLicense.href = icon.license.url;
    linkLicense.rel = 'noopener';
    linkLicense.target = '_blank';
    linkLicense.textContent = ` ${ icon.license.type }`;
    secondRow.appendChild(linkLicense);
  }

  const titleElement = document.createElement('h2');
  titleElement.className = 'grid-item__title';
  titleElement.textContent = icon.title;
  secondRow.appendChild(titleElement);

  li.appendChild(secondRow);

  const footer = document.createElement('div');
  footer.className = 'grid-item__footer';

  const flatButton = document.createElement('button');
  flatButton.className = 'grid-item__color copy-button copy-color';
  flatButton.title = `${ icon.title } Flat Badge`;
  flatButton.dataset.style = 'flat';
  // flatButton.disabled = true;
  flatButton.textContent = 'Flat';

  const squareButton = document.createElement('button');
  squareButton.className = 'grid-item__color copy-button copy-color';
  squareButton.title = `${ icon.title } Square Badge`;
  squareButton.dataset.style = 'flat-square';
  // squareButton.disabled = true;
  squareButton.textContent = 'Square';

  const plasticButton = document.createElement('button');
  plasticButton.className = 'grid-item__color copy-button copy-color';
  plasticButton.title = `${ icon.title } Plastic Badge`;
  plasticButton.dataset.style = 'plastic';
  // plasticButton.disabled = true;
  plasticButton.textContent = 'Plastic';

  footer.appendChild(flatButton);
  footer.appendChild(squareButton);
  footer.appendChild(plasticButton);
  li.appendChild(footer);

  return li;
}

function prepareIcons(iconList) {
  return iconList.map((icon, iconIndex) => {
    const luminance = getRelativeLuminance(`#${icon.hex}`);
    return {
      guidelines: icon.guidelines,
      hex: icon.hex,
      indexByAlpha: iconIndex,
      indexByColor: sortedHexes.indexOf(icon.hex),
      license: icon.license,
      light: luminance < 0.4,
      superLight: luminance > 0.55,
      superDark: luminance < 0.02,
      normalizedName: normalizeSearchTerm(icon.title),
      path: icon.path,
      shortHex: simplifyHexIfPossible(icon.hex),
      slug: icon.slug,
      title: icon.title,
      badgeEncodedTitle: encodeURIComponent(
        icon.title.replaceAll('-', '--').replaceAll('_', '__'),
      ),
    };
  });
}

function simplifyHexIfPossible(hex) {
  if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] == hex[5]) {
    return `${hex[0]}${hex[2]}${hex[4]}`;
  }

  return hex;
}
