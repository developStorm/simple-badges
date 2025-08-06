import EllipseLoader from '/public/images/Ellipsis@1x-1.0s-200px-200px.svg';

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const listItem = entry.target;
      const image = listItem.querySelector('.icon-preview');
      image.src = image.dataset.src;
      observer.unobserve(listItem);
    }
  });
})

export function createListElement(icon) {
  const listElement = document.createElement('div');
  listElement.className = 'grid-item';
  listElement.style.setProperty('--order-color', icon.indexByColor);
  listElement.dataset.brand = icon.normalizedName;
  listElement.dataset.title = icon.title;
  listElement.dataset.encoded_title = icon.badgeEncodedTitle;
  listElement.dataset.color = icon.shortHex;
  listElement.dataset.logo_color = icon.superLight ? '000' : 'fff';
  listElement.dataset.slug = icon.slug;

  const row = document.createElement('div');
  row.className = 'grid-item__row mv-2 fg-2';

  const previewButton = document.createElement('button');
  previewButton.className = 'grid-item__preview copy-button copy-svg';
  previewButton.title = `${ icon.title } SVG`;

  const img = document.createElement('img');
  img.className = 'icon-preview';
  img.src = EllipseLoader;
  img.dataset.src = icon.badgeBase64Svg;
  img.loading = 'lazy';
  img.alt = `${ icon.title } badge`;
  img.style.height = '28px';

  previewButton.appendChild(img);
  row.appendChild(previewButton);
  listElement.appendChild(row);

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

  listElement.appendChild(secondRow);

  const footer = document.createElement('div');
  footer.className = 'grid-item__footer';

  const flatButton = document.createElement('button');
  flatButton.className = 'grid-item__color copy-button copy-color';
  flatButton.title = `${ icon.title } Flat Badge`;
  flatButton.dataset.style = 'flat';
  flatButton.textContent = 'Flat';

  const squareButton = document.createElement('button');
  squareButton.className = 'grid-item__color copy-button copy-color';
  squareButton.title = `${ icon.title } Square Badge`;
  squareButton.dataset.style = 'flat-square';
  squareButton.textContent = 'Square';

  const plasticButton = document.createElement('button');
  plasticButton.className = 'grid-item__color copy-button copy-color';
  plasticButton.title = `${ icon.title } Plastic Badge`;
  plasticButton.dataset.style = 'plastic';
  plasticButton.textContent = 'Plastic';

  footer.appendChild(flatButton);
  footer.appendChild(squareButton);
  footer.appendChild(plasticButton);
  listElement.appendChild(footer);

  observer.observe(listElement);

  return listElement;
}
