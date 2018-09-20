/* jshint node: true */
'use strict';

const logger = require('@blackbaud/skyux-logger');
const fs = require('fs-extra');
const rimraf = require('rimraf');
const path = require('path');

const {
  dirHasChanges,
  exec,
  getBuildId
} = require('./utils');

const webdriverDir = 'skyux-visualtest-results';
const diffScreenshotsDir = 'screenshots-diff';

/**
 * Commit diff screenshots to a remote repo.
 */
function handleDiffScreenshots() {
  const buildId = getBuildId();
  const opts = { cwd: webdriverDir };
  const gitUrl = process.env.VISUAL_FAILURES_REPO_URL;
  const diffBranch = `${buildId}`;

  return Promise.resolve()
    .then(() => exec('git', ['config', '--global', 'user.email', '"sky-build-user@blackbaud.com"']))
    .then(() => exec('git', ['config', '--global', 'user.name', '"Blackbaud Sky Build User"']))
    .then(() => exec('git', ['clone', gitUrl, '--single-branch', webdriverDir]))
    .then(() => fs.copy(diffScreenshotsDir, path.resolve(webdriverDir, diffScreenshotsDir)))
    .then(() => exec('git', ['checkout', '-b', diffBranch], opts))
    .then(() => exec('git', ['add', diffScreenshotsDir], opts))
    .then(() => exec('git', [
      'commit', '-m', `Build #${buildId}: Screenshot results pushed to skyux-visualtest-results.`
    ], opts))
    .then(() => exec('git', ['push', '-fq', 'origin', diffBranch], opts))
    .then(() => {
      const url = gitUrl.split('@')[1].replace('.git', '');
      return Promise.reject(new Error([
        `SKY UX visual test failure!`,
        `Screenshots may be viewed at:`,
        `https://${url}/tree/${diffBranch}`
      ].join('\n')));
    });
}

function checkScreenshots() {
  return Promise.resolve()
    .then(() => dirHasChanges(path.resolve(diffScreenshotsDir, 'diff')))
    .then((hasChanges) => {
      if (hasChanges) {
        logger.info('Visual changes detected...');
        return handleDiffScreenshots();
      }

      logger.info('No visual changes detected. Done.');
    });
}

checkScreenshots()
  .then(() => {
    rimraf.sync(webdriverDir);
    process.exit(0);
  })
  .catch((err) => {
    logger.error(err.message);
    rimraf.sync(webdriverDir);
    process.exit(1);
  });