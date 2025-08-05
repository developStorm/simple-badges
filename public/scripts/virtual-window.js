import VirtualScroller from 'virtual-scroller/dom';
import badgesData from '/public/data/badges.json';
import { createListElement } from './icons.js';
import initOrdering from './ordering.js';
import { ORDER_ALPHABETICALLY, ORDER_BY_COLOR } from './ordering.js';

export default function initVirtualWindow(window, document, navigator, storage) {
  const container = document.getElementById('virtual-list');

  if (!container) {
    console.error('Virtual window element not found');
    return;
  }

  const scroller = initScroller(container, badgesData);

  initOrdering(document, storage, (orderType) => {
    const columnsCount = getColumnsCount(container);
    const sortedData = sortBadges(Object.values(badgesData), orderType);
    scroller.setItems(groupIntoRows(sortedData, columnsCount));
  });
}

function initScroller(container, badgesData) {
  const columnsCount = getColumnsCount(container);
  const itemsRows = groupIntoRows(Object.values(badgesData), columnsCount);

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
    itemsRows,
    renderItem
  )

  return scroller;
}

function groupIntoRows(items, columnsCount) {
  const rows = [];
  for (let i = 0; i < items.length; i += columnsCount) {
    rows.push(items.slice(i, i + columnsCount));
  }
  return rows;
}

function sortBadges(items, orderType) {
  const sorted = [...items];
  if (orderType === ORDER_ALPHABETICALLY) {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (orderType === ORDER_BY_COLOR) {
    sorted.sort((a, b) => a.indexByColor - b.indexByColor);
  }

  return sorted;
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
