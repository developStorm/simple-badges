import { STORAGE_KEY_COLOR_SCHEME } from './storage.js';

const COLOR_SCHEME_DARK = 'dark';
const COLOR_SCHEME_LIGHT = 'light';
const COLOR_SCHEME_SYSTEM = 'system';

const DEFAULT_COLOR_SCHEME = COLOR_SCHEME_LIGHT;

const CLASS_DARK_MODE = 'dark';
const CLASS_LIGHT_MODE = 'light';

export default function initColorScheme(document, storage) {
  let activeColorScheme = DEFAULT_COLOR_SCHEME;

  const $body = document.querySelector('body');
  $body.classList.remove(CLASS_DARK_MODE, CLASS_LIGHT_MODE);
  $body.classList.add(CLASS_LIGHT_MODE);
}
