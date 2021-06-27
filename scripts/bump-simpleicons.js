#!/usr/bin/env node
/**
 * @fileoverview
 * Updates the simple-icons dependency to the same version used in Shields.io backend.
 * Upon success, the new simple-icons dependency version is outputted.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PACKAGE_JSON_FILE = path.resolve(__dirname, '..', 'package.json');

function getManifest() {
  const packageFileRaw = fs.readFileSync(PACKAGE_JSON_FILE).toString();
  const packageFile = JSON.parse(packageFileRaw);
  return packageFile;
}

function getShieldManifest() {
  return httpRequest(
    'https://raw.githubusercontent.com/badges/shields/master/package.json',
  );
}

async function main() {
  try {
    const manifestBefore = getManifest();
    const versionBefore = manifestBefore.dependencies['simple-icons'];
    const shieldSIVersion = (await getShieldManifest()).dependencies[
      'simple-icons'
    ];

    if (versionBefore === shieldSIVersion) {
      console.error(
        'Simple Icons version installed is consistent with Shields.io backend, no action needed.',
      );
      process.exit(0);
    }

    execSync('npm uninstall simple-icons', { stdio: 'ignore' });
    execSync(`npm install --save-exact simple-icons@${shieldSIVersion}`, {
      stdio: 'ignore',
    });

    const manifestAfter = getManifest();
    const versionAfter = manifestAfter.dependencies['simple-icons'];

    console.log(versionAfter);
  } catch (error) {
    console.error('Failed to update simple-icons to latest version:', error);
    process.exit(1);
  }
}

main();

// https://stackoverflow.com/a/38543075
function httpRequest(params, postData) {
  return new Promise(function (resolve, reject) {
    const req = https.request(params, function (res) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('statusCode=' + res.statusCode));
      }
      // cumulate data
      let body = [];
      res.on('data', function (chunk) {
        body.push(chunk);
      });
      res.on('end', function () {
        try {
          body = JSON.parse(Buffer.concat(body).toString());
        } catch (e) {
          reject(e);
        }
        resolve(body);
      });
    });
    req.on('error', function (err) {
      reject(err);
    });
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}
