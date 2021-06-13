import { STORAGE_KEY_COPY_METHOD } from './storage.js';

export const COPY_AS_MARKDOWN = 'COPY_AS_MARKDOWN';
export const COPY_AS_HTML = 'COPY_AS_HTML';
export const COPY_AS_LINK = 'COPY_AS_LINK';

const DEFAULT_COPY_FORMAT = COPY_AS_MARKDOWN;

const CLASS_COPY_ACTIVE = 'copy-control-active';

const COPIED_TIMEOUT = 1000;

function setCopied($el) {
  $el.classList.add('copied');
  setTimeout(() => $el.classList.remove('copied'), COPIED_TIMEOUT);
}

export default function initCopyButtons(window, document, navigator) {
  let activeCopyMethod = DEFAULT_COPY_FORMAT;

  // Init copy option controls 
  const $copyAsMarkdown = document.getElementById('copy-as-markdown');
  const $copyAsHTML = document.getElementById('copy-as-html');
  const $copyAsLink = document.getElementById('copy-as-link');

  $copyAsMarkdown.disabled = false;
  $copyAsHTML.disabled = false;
  $copyAsLink.disabled = false;

  $copyAsMarkdown.addEventListener('click', (event) => {
    event.preventDefault();
    selectCopyFormat(COPY_AS_MARKDOWN);
    $copyAsMarkdown.blur();
  });
  $copyAsHTML.addEventListener('click', (event) => {
    event.preventDefault();
    selectCopyFormat(COPY_AS_HTML);
    $copyAsHTML.blur();
  });
  $copyAsLink.addEventListener('click', (event) => {
    event.preventDefault();
    selectCopyFormat(COPY_AS_LINK);
    $copyAsLink.blur();
  });

  // Init icon copy buttons
  const $copyInput = document.getElementById('copy-input');
  const $colorButtons = document.querySelectorAll('.copy-color');
  const $svgButtons = document.querySelectorAll('.copy-svg');

  $colorButtons.forEach(($colorButton) => {
    $colorButton.removeAttribute('disabled');
    $colorButton.addEventListener('click', (event) => {
      event.preventDefault();

      const value = $colorButton.attributes['data-badge-url'].value;
      $colorButton.blur();
      copyValue(value);
      setCopied($colorButton);
    });
  });

  $svgButtons.forEach(($svgButton) => {
    $svgButton.removeAttribute('disabled');
    $svgButton.addEventListener('click', (event) => {
      event.preventDefault();

      const $img = $svgButton.querySelector('img');
      const value = $img.getAttribute('src');

      $svgButton.blur();
      copyValue(value);
      setCopied($svgButton);
    });
  });

  function copyValue(value) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value);
    } else {
      $copyInput.value = value;
      $copyInput.select();
      document.execCommand('copy');
      $copyInput.blur();
    }
  }

  function selectCopyFormat(selected) {
    if (selected === activeCopyMethod) {
      return;
    }

    $copyAsMarkdown.classList.remove(CLASS_COPY_ACTIVE);
    $copyAsHTML.classList.remove(CLASS_COPY_ACTIVE);
    $copyAsLink.classList.remove(CLASS_COPY_ACTIVE);

    if (selected === COPY_AS_MARKDOWN) {
      $copyAsMarkdown.classList.add(CLASS_COPY_ACTIVE);
    } else if (selected === COPY_AS_HTML) {
      $copyAsHTML.classList.add(CLASS_COPY_ACTIVE);
    } else if (selected === COPY_AS_LINK) {
      $copyAsLink.classList.add(CLASS_COPY_ACTIVE);
    }

    // storage.setItem(STORAGE_KEY_COPY_METHOD, selected);
    activeCopyMethod = selected;
  }
}
