import '../stylesheet.css';

import * as domUtils from './dom-utils.js';
import { groupIntoRows } from './utils.js';
import newStorage from './storage.js';

import initVirtualWindow from './virtual-window.js';
import initCopyButtons from './copy.js';
import initColorScheme from './color-scheme.js';
import initOrdering from './ordering.js';
import initSearch from './search.js';

console.log('Build #DEVELOPMENT_BUILD#');
document.body.classList.remove('no-js');

const $loader = document.getElementById('loader');
if ($loader) $loader.remove();

let currentBadges = ICONS_DATA;
const storage = newStorage(localStorage);

initColorScheme(document, storage);
initCopyButtons(window, document, navigator, storage);
const { scroller, virtualWindowContainer } = initVirtualWindow(
  window,
  document,
  () => currentBadges,
);
const orderingControls = initOrdering(document, storage, () => currentBadges, (sortedData) => {
  const columnsCount = domUtils.getColumnsCount(virtualWindowContainer);
  currentBadges = sortedData;
  scroller.setItems(groupIntoRows(sortedData, columnsCount));
});
initSearch(
  window.history,
  document,
  orderingControls,
  domUtils,
  ICONS_DATA,
  (results, query) => {
    const columnsCount = domUtils.getColumnsCount(virtualWindowContainer);
    const sortedData = orderingControls.sortBadges(results);
    currentBadges = sortedData;
    scroller.setItems(groupIntoRows(sortedData, columnsCount));
  },
);
