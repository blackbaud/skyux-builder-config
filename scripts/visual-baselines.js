/* jshint node: true */
'use strict';

const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const logger = require('@blackbaud/skyux-logger');

const {
  exec,
  dirHasChanges,
  getOriginUrl
} = require('./utils');

const baselineScreenshotsDir = 'screenshots-baseline';
const tempDir = '.skypagesvisualbaselinetemp';

let gitOriginUrl;

function handleBaselineScreenshots() {
  const buildId = new Date().getTime();
  const branch = 'master';
  const opts = { cwd: tempDir };

  return Promise.resolve()
    .then(() => exec('git', ['config', '--global', 'user.email', '"sky-build-user@blackbaud.com"']))
    .then(() => exec('git', ['config', '--global', 'user.name', '"Blackbaud Sky Build User"']))
    .then(() => exec('git', ['clone', gitOriginUrl, '--single-branch', tempDir]))
    .then(() => fs.copy(
      baselineScreenshotsDir,
      path.resolve(tempDir, baselineScreenshotsDir)
    ))
    .then(() => exec('git', ['checkout', '-b', branch], opts))
    .then(() => exec('git', ['status'], opts))
    .then(() => exec('git', ['add', baselineScreenshotsDir], opts))
    .then(() => exec('git', ['commit', '-m', `Build #${buildId}: Added new baseline screenshots.`], opts))
    .then(() => exec('git', ['push', '-fq', 'origin', branch], opts))
    .then(() => {
      logger.info('New baseline images saved.');
    });
}

function checkScreenshots() {
  return Promise.resolve()
    // Get origin URL.
    .then(() => getOriginUrl())
    .then((url) => {
      gitOriginUrl = url.replace(
        'https://',
        `https://${process.env.GITHUB_ACCESS_TOKEN}@`
      );
    })

    // Check baseline screenshots.
    .then(() => dirHasChanges(baselineScreenshotsDir))
    .then((hasChanges) => {
      if (hasChanges) {
        logger.info('New baseline images detected.');
        return handleBaselineScreenshots();
      }

      logger.info('No new baseline images detected. Done.');
    });
}

checkScreenshots()
  .then(() => {
    rimraf.sync(tempDir);
    process.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    rimraf.sync(tempDir);
    process.exit(1);
  });