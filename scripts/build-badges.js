const fs = require('fs');
const path = require('path');
const { makeBadge } = require('badge-maker');
const simpleIcons = require('simple-icons');
const getRelativeLuminance = require('get-relative-luminance').default;
const { normalizeSearchTerm } = require('../public/scripts/utils.js');
const sortByColors = require('./color-sorting.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'data');
const OUTPUT_FILE_PATH = path.join(OUTPUT_DIR, 'badges-manifest.json');
const CHUNK_MAX_SIZE_KB = 200;
const CHUNK_MAX_SIZE_BYTES = CHUNK_MAX_SIZE_KB * 1024;

const icons = Object.values(simpleIcons);
const sortedHexes = sortByColors(icons.map((icon) => icon.hex));

const processedIcons = prepareIcons(icons);
const manifestData = {};

let currentChunk = {};
let currentChunkSize = 0;
let chunkId = 0;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

for (const [index, processedIcon] of processedIcons.entries()) {
  try {
    const svgContent = makeBadge({
      color: processedIcon.shortHex,
      message: processedIcon.title,
      logoBase64: processedIcon.logoBase64Svg,
      style: 'for-the-badge',
    });

    const base64Encoded = Buffer.from(svgContent).toString('base64');
    const badgeBase64Svg = `data:image/svg+xml;base64,${base64Encoded}`;
    const dataSize = Buffer.byteLength(JSON.stringify(badgeBase64Svg), 'utf8');

    if (currentChunkSize + dataSize > CHUNK_MAX_SIZE_BYTES && Object.keys(currentChunk).length > 0) {
      writeCurrentChunkToFile();
    }

    currentChunk[processedIcon.slug] = badgeBase64Svg;
    currentChunkSize += dataSize;

    manifestData[processedIcon.slug] = {
      ...processedIcon,
      chunkFile: `badges-chunk-${chunkId}.json`,
    };

    // Delete heavy and unnecessary data
    delete manifestData[processedIcon.slug].logoBase64Svg;
  } catch (e) {
    console.error(
      `Error while generating badge ${processedIcon.slug}: ${e.message}`,
    );
  }
}

// save last chunk
if (Object.keys(currentChunk).length > 0) {
  writeCurrentChunkToFile();
}

fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(manifestData, null, 2));

function writeCurrentChunkToFile() {
  const chunkFileName = `badges-chunk-${chunkId}.json`;
  const chunkFilePath = path.join(OUTPUT_DIR, chunkFileName);
  fs.writeFileSync(chunkFilePath, JSON.stringify(currentChunk, null, 2));

  currentChunk = {};
  currentChunkSize = 0;
  chunkId++;
}

function prepareIcons(iconList) {
  return iconList.map((icon, iconIndex) => {
    const luminance = getRelativeLuminance(`#${icon.hex}`);
    const iconColor = luminance > 0.55 ? '000' : 'fff';
    const logoSvg = changeSvgColor(icon.svg, iconColor);

    return {
      guidelines: icon.guidelines,
      hex: icon.hex,
      indexByColor: sortedHexes.indexOf(icon.hex),
      license: icon.license,
      normalizedName: normalizeSearchTerm(icon.title),
      shortHex: simplifyHexIfPossible(icon.hex),
      slug: icon.slug,
      title: icon.title,
      badgeEncodedTitle: encodeURIComponent(
        icon.title.replaceAll('-', '--').replaceAll('_', '__'),
      ),
      logoBase64Svg:
        'data:image/svg+xml;base64,' + Buffer.from(logoSvg).toString('base64'),
    };
  });
}

function simplifyHexIfPossible(hex) {
  if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] == hex[5]) {
    return `${hex[0]}${hex[2]}${hex[4]}`;
  }

  return hex;
}

function changeSvgColor(svgString, newColor) {
  if (svgString.match(/<svg[^>]*fill="/)) {
    return svgString.replace(
      /(<svg[^>]*)(fill="[^"]*")([^>]*>)/,
      `$1fill="#${newColor}"$3`,
    );
  } else {
    return svgString.replace(/<svg/, `<svg fill="#${newColor}"`);
  }
}
