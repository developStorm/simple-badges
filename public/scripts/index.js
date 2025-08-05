import '../stylesheet.css';

import * as domUtils from './dom-utils.js';
import newStorage from './storage.js';

import initVirtualWindow from './virtual-window.js';
import initCopyButtons from './copy.js';
import initColorScheme from './color-scheme.js';
import initOrdering from './ordering.js';
import initSearch from './search.js';

console.log('Build #DEVELOPMENT_BUILD#');
document.body.classList.remove('no-js');

const storage = newStorage(localStorage);
const loader = document.getElementById('loader');
loader.remove();

initVirtualWindow(window, document, navigator, storage);
initColorScheme(document, storage);
initCopyButtons(window, document, navigator, storage);
// const orderingControls = initOrdering(document, storage);
initSearch(window.history, document, orderingControls, domUtils);

