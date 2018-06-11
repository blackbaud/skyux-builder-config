/* jshint node: true */
'use strict';

const fs = require('fs-extra');
const rimraf = require('rimraf');
const path = require('path');

const {
  exec,
  dirHasChanges,
  getFeatureBranch,
  getOriginUrl
} = require('./utils');

const githubAccessToken = process.env.VISUAL_FAILURES_ACCESS_TOKEN;
const webdriverDir = 'skyux-visualtest-results';
const diffScreenshotsDir = 'screenshots-diff';

let gitOriginUrl;
let gitFeatureBranch;

/**
 * Commit diff screenshots to a remote repo.
 */
function handleDiffScreenshots() {
  const buildId = new Date().getTime();
  const opts = { cwd: webdriverDir };
  const name = gitOriginUrl.split('/')[1].replace('.git', '');
  const diffBranch = `${name}_${gitFeatureBranch}_${buildId}-webdriver`;

  return Promise.resolve()
    .then(() => exec('git', ['config', '--global', 'user.email', '"sky-build-user@blackbaud.com"']))
    .then(() => exec('git', ['config', '--global', 'user.name', '"Blackbaud Sky Build User"']))
    .then(() => exec('git', ['clone', `https://${githubAccessToken}@github.com/blackbaud/skyux-visualtest-results.git`, '--single-branch', webdriverDir]))
    .then(() => fs.copy(diffScreenshotsDir, path.resolve(webdriverDir, diffScreenshotsDir)))
    .then(() => exec('git', ['checkout', '-b', diffBranch], opts))
    .then(() => exec('git', ['add', diffScreenshotsDir], opts))
    .then(() => exec('git', ['commit', '-m', `Build #${buildId}: Screenshot results pushed to skyux-visualtest-results.`], opts))
    .then(() => exec('git', ['push', '-fq', 'origin', diffBranch], opts))
    .then(() => {
      return Promise.reject(new Error([
        `SKY UX visual test failure!`,
        `Screenshots may be viewed at:`,
        `https://github.com/blackbaud/skyux-visualtest-results/tree/${diffBranch}`
      ].join('\n')));
    });
}

function checkScreenshots() {
  return Promise.resolve()
    // Get origin URL.
    .then(() => getOriginUrl())
    .then((url) => {
      gitOriginUrl = url;
    })

    // Get name of feature branch.
    .then(() => getFeatureBranch())
    .then((branch) => {
      gitFeatureBranch = branch;
    })

    // Check diff screenshots.
    .then(() => dirHasChanges(path.resolve(diffScreenshotsDir, 'diff')))
    .then((hasChanges) => {
      if (hasChanges) {
        return handleDiffScreenshots();
      }
    });
}

checkScreenshots()
  .then(() => {
    console.log('No visual changes detected.');
    rimraf.sync(webdriverDir);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    rimraf.sync(webdriverDir);
    process.exit(1);
  });
