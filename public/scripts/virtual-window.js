import VirtualScroller from 'virtual-scroller/dom';
import { createListElement } from './icons.js';
import { getColumnsCount } from './dom-utils.js';
import { groupIntoRows } from './utils.js';

export default function initVirtualWindow(window, document, getBadges) {
  const $container = document.getElementById('virtual-list');

  if (!$container) {
    throw new Error('Virtual window element not found.');
  }

  let columnsCount = getColumnsCount($container);
  const itemsRows = groupIntoRows(getBadges(), columnsCount);
  const scroller = initScroller($container, itemsRows);

  function updateColumnsCount() {
    const newColumnsCount = getColumnsCount($container);

    if (newColumnsCount !== columnsCount) {
      scroller.setItems(groupIntoRows(getBadges(), newColumnsCount));
      columnsCount = newColumnsCount;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateColumnsCount);
  } else {
    updateColumnsCount();
  }
  window.addEventListener('resize', updateColumnsCount);

  return {
    scroller,
    virtualWindowContainer: $container,
  };
}

function initScroller($container, items) {
  function renderItem(row) {
    const $rowElement = document.createElement('div');
    $rowElement.className = 'grid';

    row.forEach((item) => {
      const $listElement = createListElement(item);
      $rowElement.appendChild($listElement);
    });

    return $rowElement;
  }

  return new VirtualScroller($container, items, renderItem);
}
