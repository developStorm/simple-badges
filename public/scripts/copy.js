import { STORAGE_KEY_COPY_METHOD } from './storage.js';

export const COPY_AS_MARKDOWN = 'COPY_AS_MARKDOWN';
export const COPY_AS_HTML = 'COPY_AS_HTML';
export const COPY_AS_LINK = 'COPY_AS_LINK';

const DEFAULT_COPY_FORMAT = COPY_AS_MARKDOWN;

const CLASS_COPY_ACTIVE = 'copy-control-active';

const COPIED_TIMEOUT = 1000;

const SHIELDS_BASE_URL = 'https://img.shields.io';

function setCopied($el) {
  $el.classList.add('copied');
  setTimeout(() => $el.classList.remove('copied'), COPIED_TIMEOUT);
}

export default function initCopyButtons(window, document, navigator, storage) {
  let activeCopyMethod = DEFAULT_COPY_FORMAT;

  // Init copy option controls
  const $copyAsMarkdown = document.getElementById('copy-as-markdown');
  const $copyAsHTML = document.getElementById('copy-as-html');
  const $copyAsLink = document.getElementById('copy-as-link');

  $copyAsMarkdown.disabled = false;
  $copyAsHTML.disabled = false;
  $copyAsLink.disabled = false;

  if (storage.hasItem(STORAGE_KEY_COPY_METHOD)) {
    selectCopyFormat(storage.getItem(STORAGE_KEY_COPY_METHOD));
  }

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
  const $copyButtons = document.querySelectorAll('.copy-button');

  $copyButtons.forEach(($copyButton) => {
    $copyButton.removeAttribute('disabled');
    $copyButton.addEventListener('click', (event) => {
      event.preventDefault();

      const $parentListItem = $copyButton.closest('li');
      const iconEncodedTitle = $parentListItem.dataset.encoded_title;
      const iconTitle = $parentListItem.dataset.title;
      const iconColor = $parentListItem.dataset.color;
      const iconSlug = $parentListItem.dataset.slug;
      const iconStyle = $copyButton.dataset.style;
      const badgeURL =
        SHIELDS_BASE_URL +
        `/badge/${iconEncodedTitle}-${iconColor}?logo=${iconSlug}&logoColor=fff&style=${iconStyle}`;

      let value;
      switch (activeCopyMethod) {
        case COPY_AS_MARKDOWN:
          value = `![${iconTitle} Badge](${badgeURL})`;
          break;
        case COPY_AS_HTML:
          value = `<img src="${badgeURL}" alt="${iconTitle} Badge">`;
          break;
        case COPY_AS_LINK:
          value = badgeURL;
          break;
      }

      $copyButton.blur();
      copyValue(value);
      setCopied($copyButton);
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

    storage.setItem(STORAGE_KEY_COPY_METHOD, selected);
    activeCopyMethod = selected;
  }
}
