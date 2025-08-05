import VirtualScroller from 'virtual-scroller/dom';
import badgesData from '/public/data/badges.json';
import { createListElement } from './icons.js';
import { getColumnsCount } from './dom-utils.js';
import { groupIntoRows } from './utils.js';

export default function initVirtualWindow(window, document, navigator, storage) {
  const container = document.getElementById('virtual-list');

  if (!container) {
    console.error('Virtual window element not found');
    return;
  }

  let columnsCount = getColumnsCount(container);
  const itemsRows = groupIntoRows(Object.values(badgesData), columnsCount);
  const scroller = initScroller(container, itemsRows);

  window.addEventListener('resize', () => {
    const newColumnsCount = getColumnsCount(container);

    if (newColumnsCount !== columnsCount) {
      scroller.setItems(groupIntoRows(Object.values(badgesData), newColumnsCount));
      columnsCount = newColumnsCount;
    }
  })

  return {
    scroller,
    virtualWindowContainer: container,
  }
}

function initScroller(container, items) {
  const renderItem = (row) => {
    const rowElement = document.createElement('div');
    rowElement.className = 'grid-row';

    row.forEach(item => {
      const listElement = createListElement(item);
      rowElement.appendChild(listElement);
    });

    return rowElement;
  }

  return  new VirtualScroller(
    container,
    items,
    renderItem
  );
}
