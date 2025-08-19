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

export function getColumnsCount($container) {
  const rootFontSize = parseFloat(
    window.getComputedStyle(document.documentElement).fontSize,
  );
  const computedStyle = window.getComputedStyle($container);

  const minColumnWidthRem =
    parseFloat(computedStyle.getPropertyValue('--grid-width')) || 13.5;
  const gapRem =
    parseFloat(computedStyle.getPropertyValue('--grid-gap')) || 0.75;

  const minColumnWidthPx = minColumnWidthRem * rootFontSize;
  const gapPx = gapRem * rootFontSize;

  const containerWidth = $container.clientWidth;
  const count = Math.floor(
    (containerWidth + gapPx) / (minColumnWidthPx + gapPx),
  );

  return Math.max(1, count);
}
