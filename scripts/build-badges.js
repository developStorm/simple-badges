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

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const icons = Object.values(simpleIcons);
const sortedHexes = sortByColors(icons.map((icon) => icon.hex));

const processedIcons = prepareIcons(icons);

const { manifestData, chunks } = buildBadges(processedIcons);
writeBadgesToFile(manifestData, chunks);

function buildBadges (iconsToBuild) {
  const manifestData = {};
  const chunks = [];

  let currentChunk = {};
  let currentChunkSize = 0;
  let chunkId = 0;

  for (const icon of iconsToBuild.values()) {
    try {
      const svgContent = makeBadge({
        color: icon.shortHex,
        message: icon.title,
        logoBase64: icon.logoBase64Svg,
        style: 'for-the-badge',
      });

      const base64Encoded = Buffer.from(svgContent).toString('base64');
      const badgeBase64Svg = `data:image/svg+xml;base64,${base64Encoded}`;
      const dataSize = Buffer.byteLength(JSON.stringify(badgeBase64Svg), 'utf8');

      if (currentChunkSize + dataSize > CHUNK_MAX_SIZE_BYTES && Object.keys(currentChunk).length > 0) {
        const chunkFileName = `badges-chunk-${chunkId}.json`;
        const chunkFilePath = path.join(OUTPUT_DIR, chunkFileName);
        chunks.push({ path: chunkFilePath, data: currentChunk });

        currentChunk = {};
        currentChunkSize = 0;
        chunkId++;
      }

      currentChunk[icon.slug] = badgeBase64Svg;
      currentChunkSize += dataSize;

      manifestData[icon.slug] = {
        ...icon,
        chunkFile: `badges-chunk-${chunkId}.json`,
      };

      // Delete heavy and unnecessary data
      delete manifestData[icon.slug].logoBase64Svg;
    } catch (e) {
      console.error(
        `Error while generating badge ${icon.slug}: ${e.message}`,
      );
    }
  }

  // save last chunk
  if (Object.keys(currentChunk).length > 0) {
    const chunkFileName = `badges-chunk-${chunkId}.json`;
    const chunkFilePath = path.join(OUTPUT_DIR, chunkFileName);
    chunks.push({ path: chunkFilePath, data: currentChunk });
  }

  return {
    manifestData,
    chunks,
  }
}

function writeBadgesToFile (manifestData, chunks) {
  fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(manifestData, null, 2));

  for (const chunk of chunks) {
    fs.writeFileSync(chunk.path, JSON.stringify(chunk.data, null, 2));
  }
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
