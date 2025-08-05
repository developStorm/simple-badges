import '../stylesheet.css';
import badgesData from '../data/badges.json'

import * as domUtils from './dom-utils.js';
import { groupIntoRows } from './utils.js';
import newStorage from './storage.js';

import initVirtualWindow from './virtual-window.js';
import initCopyButtons from './copy.js';
import initColorScheme from './color-scheme.js';
import initOrdering, { sortBadges } from './ordering.js';
import initSearch from './search.js';

console.log('Build #DEVELOPMENT_BUILD#');
document.body.classList.remove('no-js');
const loader = document.getElementById('loader');
if (loader) {
  loader.remove();
}

const storage = newStorage(localStorage);
let currentBadges = Object.values(badgesData);
initColorScheme(document, storage);
initCopyButtons(window, document, navigator, storage);
const { scroller, virtualWindowContainer } = initVirtualWindow(window, document, () => currentBadges);
const orderingControls = initOrdering(document, storage, (orderType) => {
  const columnsCount = domUtils.getColumnsCount(virtualWindowContainer);
  const sortedData = sortBadges(Object.values(badgesData), orderType);
  currentBadges = sortedData;
  scroller.setItems(groupIntoRows(sortedData, columnsCount));
});
initSearch(window.history, document, orderingControls, domUtils);
