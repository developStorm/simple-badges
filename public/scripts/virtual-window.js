import VirtualScroller from 'virtual-scroller/dom';
import badgesData from '/public/data/badges.json';
import { createListElement } from './icons.js';

export default function initVirtualWindow(window, document, navigator, storage) {
  const container = document.getElementById('virtual-list');

  if (!container) {
    console.error('Virtual window element not found');
    return;
  }

  const columnsCount = getColumnsCount(container);
  const productsInRows = groupIntoRows(Object.values(badgesData), columnsCount);

  const renderItem = (row) => {
    const rowElement = document.createElement('div');
    rowElement.className = 'grid';

    row.forEach(item => {
      const listElement = createListElement(item);
      rowElement.appendChild(listElement);
    });

    return rowElement;
  }

  const scroller = new VirtualScroller(
    container,
    productsInRows,
    renderItem
  )
}

function groupIntoRows(items, columnsCount) {
  const rows = [];
  for (let i = 0; i < items.length; i += columnsCount) {
    rows.push(items.slice(i, i + columnsCount));
  }
  return rows;
}

function getColumnsCount(containerElement) {
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
