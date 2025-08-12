const fs = require('fs');
const path = require('path');
const { makeBadge } = require('badge-maker');
const simpleIcons = require('simple-icons');
const getRelativeLuminance = require('get-relative-luminance').default;
const { normalizeSearchTerm } = require('../public/scripts/utils.js');
const sortByColors = require('./color-sorting.js');
const SVGSpriter = require('svg-sprite');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'data');
const MANIFEST_FILE_PATH = path.join(OUTPUT_DIR, 'badges-manifest.json');
const CHUNK_MAX_SIZE_KB = 200;
const CHUNK_MAX_SIZE_BYTES = CHUNK_MAX_SIZE_KB * 1024;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

main();

function main() {
  const icons = Object.values(simpleIcons);
  const sortedHexes = sortByColors(icons.map((icon) => icon.hex));
  const processedIcons = prepareIcons(icons, sortedHexes);
  const badges = createBadges(processedIcons);
  const { manifestData, chunks } = compileBadgesChunks(processedIcons, badges, CHUNK_MAX_SIZE_BYTES);

  fs.writeFileSync(MANIFEST_FILE_PATH, JSON.stringify(manifestData, null, 2));

  for (const { path, data } of chunks) {
    const sprite = generateSprite(data);
    fs.writeFileSync(path, sprite);
  }
}

function createBadge (icon) {
  try {
    const svgContent = makeBadge({
      color: icon.shortHex,
      message: icon.title,
      logoBase64: icon.logoBase64Svg,
      style: 'for-the-badge',
    });

    return svgContent;
  } catch (e) {
    console.error(
      `Error while generating badge ${icon.slug}: ${e.message}`,
    );
  }
}

function createBadges (icons) {
  const badges = {};

  for (const icon of icons) {
    badges[icon.slug] = createBadge(icon);
  }

  return badges;
}

function compileBadgesChunks (icons, badges, chunkSize) {
  const manifestData = {};
  const chunks = [];

  let currentChunk = {};
  let currentChunkSize = 0;
  let chunkId = 0;

  const getFileName = () => `sprite-badges-chunk-${chunkId}.svg`;

  for (const icon of icons) {
    try {
      const chunkFileName = getFileName();
      const chunkFilePath = path.join(OUTPUT_DIR, chunkFileName);
      const badgeSvg = badges[icon.slug];
      const dataSize = Buffer.byteLength(badgeSvg, 'utf8');

      if (currentChunkSize + dataSize > chunkSize && Object.keys(currentChunk).length > 0) {
        chunks.push({ path: chunkFilePath, fileName: chunkFileName, data: currentChunk });

        currentChunk = {};
        currentChunkSize = 0;
        chunkId++;
      }

      currentChunk[icon.slug] = badgeSvg;
      currentChunkSize += dataSize;

      manifestData[icon.slug] = {
        ...icon,
        chunkFile: chunkFileName,
      };

      // Delete heavy and unnecessary data
      delete manifestData[icon.slug].logoBase64Svg;
    } catch (e) {
      console.error(
        `Error while compiling badges chunk for ${icon.slug}: ${e.message}`,
      );
    }
  }

  // save last chunk
  if (Object.keys(currentChunk).length > 0) {
    const chunkFileName = getFileName();
    const chunkFilePath = path.join(OUTPUT_DIR, chunkFileName);
    chunks.push({ path: chunkFilePath, fileName: chunkFileName, data: currentChunk });
  }

  return {
    manifestData,
    chunks,
  }
}

function generateSprite (badges) {
  const spriter = new SVGSpriter({
    mode: {
      symbol: true
    }
  });

  for (const [slug, svg] of Object.entries(badges)) {
    spriter.add(`${slug}`, null, svg);
  }

  let sprite;

  spriter.compile((error, result) => {
    sprite = result.symbol.sprite.contents;
  });

  return sprite;
}

function prepareIcons(iconList, sortedHexes) {
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
