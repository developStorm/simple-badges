const CopyPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const getRelativeLuminance = require('get-relative-luminance').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const simpleIcons = require('simple-icons');
const webpack = require('webpack');

const { normalizeSearchTerm } = require('./public/scripts/utils.js');
const sortByColors = require('./scripts/color-sorting.js');

const icons = Object.values(simpleIcons);
const sortedHexes = sortByColors(icons.map((icon) => icon.hex));

const NODE_MODULES = path.resolve(__dirname, 'node_modules');
const OUT_DIR = path.resolve(__dirname, '_site');
const ROOT_DIR = path.resolve(__dirname, 'public');

function simplifyHexIfPossible(hex) {
  if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] == hex[5]) {
    return `${hex[0]}${hex[2]}${hex[4]}`;
  }

  return hex;
}

let displayIcons = icons;
if (process.env.TEST_ENV) {
  // Use fewer icons when building for a test run. This significantly speeds up
  // page load time and therefor (end-to-end) tests, reducing the chance of
  // failed tests due to timeouts.
  displayIcons = icons.slice(0, 255);
}

const iconsData = displayIcons.map((icon, iconIndex) => {
  const luminance = getRelativeLuminance(`#${icon.hex}`);
  return {
    // base64Svg: Buffer.from(icon.svg).toString('base64'),
    guidelines: icon.guidelines,
    hex: icon.hex,
    indexByAlpha: iconIndex,
    indexByColor: sortedHexes.indexOf(icon.hex),
    license: icon.license,
    light: luminance < 0.4,
    superLight: luminance > 0.55,
    superDark: luminance < 0.02,
    normalizedName: normalizeSearchTerm(icon.title),
    path: icon.path,
    shortHex: simplifyHexIfPossible(icon.hex),
    slug: icon.slug,
    title: icon.title,
    badgeEncodedTitle: encodeURIComponent(
      icon.title.replaceAll('-', '--').replaceAll('_', '__'),
    ),
  };
});

module.exports = (env, argv) => {
  return {
    entry: {
      app: path.resolve(ROOT_DIR, 'scripts/index.js'),
    },
    output: {
      path: OUT_DIR,
      filename: 'script.js',
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.pug$/i,
          use: [
            {
              loader: 'pug-loader',
              options: {
                pretty: argv.mode === 'development',
              },
            },
          ],
        },
        {
          test: /\.svg$/i,
          type: 'asset/inline',
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(ROOT_DIR, 'images'),
            to: path.resolve(OUT_DIR, 'images'),
          },
        ],
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(ROOT_DIR, 'index.pug'),
        templateParameters: {
          iconCount: icons.length,
          twitterIcon: icons.find((icon) => icon.title === 'X'),
          pageTitle: 'Simple Badges',
          pageDescription: `${icons.length} Awesome Simple Icons on your favorite Shields.io Badges.`,
          pageUrl: 'https://badges.pages.dev',
        },
      }),
      new MiniCssExtractPlugin(),
      new webpack.DefinePlugin({
        ICONS_DATA: JSON.stringify(iconsData),
      }),
    ],
    optimization: {
      minimizer:
        argv.mode === 'development'
          ? []
          : [
              '...', // <- Load all default minimizers
              new CssMinimizerPlugin(),
            ],
    },
    cache: process.argv.includes('--watch')
      ? { type: 'memory' }
      : {
          cacheLocation: path.resolve(
            __dirname,
            '.cache',
            process.argv.includes('development') ? 'webpack-dev' : 'webpack',
          ),
          type: 'filesystem',
          version: '1',
        },
  };
};
