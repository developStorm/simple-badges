export function hideElement($el) {
  if ($el) {
    $el.classList.add('hidden');
    $el.setAttribute('aria-hidden', 'true');
  }
}

export function showElement($el) {
  if ($el) {
    $el.classList.remove('hidden');
    $el.removeAttribute('aria-hidden');
  }
}

export function addClass($el, clazz) {
  if ($el) {
    $el.classList.add(clazz);
  }
}

export function removeClass($el, clazz) {
  if ($el) {
    $el.classList.remove(clazz);
  }
}

export function toggleClass($el, clazz) {
  if ($el) {
    $el.classList.toggle(clazz);
  }
}

export function getColumnsCount(containerElement) {
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

  // TODO Variables from CSS
  const minColumnWidthRem = 13.5;
  const gapRem = 0.75;

  const minColumnWidthPx = minColumnWidthRem * rootFontSize;
  const gapPx = gapRem * rootFontSize;

  const containerWidth = containerElement.clientWidth;
  const columns = Math.floor((containerWidth + gapPx) / (minColumnWidthPx + gapPx));

  return columns;
}
