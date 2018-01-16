/*jshint node: true*/
'use strict';

const path = require('path');
const minimist = require('minimist');
const shared = require('@blackbaud/skyux-builder/config/karma/shared.karma.conf');
const logger = require('../utils/logger');

// Needed since we bypass Karma cli
const args = minimist(process.argv.slice(2));

/**
 * VSTS platform overrides.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {

  const customLaunchers = {
    bs_windows_chrome_latest: {
      base: 'BrowserStack',
      browser: 'chrome',
      os: 'Windows',
      os_version: '10',
      build: args.buildId
    }
  };

  // Apply defaults
  shared(config);

  // For backwards compatability, Karma overwrites arrays
  config.reporters.push('junit');
  config.coverageReporter.reporters.push({
    type: 'cobertura'
  });

  // Custom plugin used to read the Browserstack session
  config.reporters.push('blackbaud-browserstack');
  config.plugins.push({
    'reporter:blackbaud-browserstack': [
      'type',
      function (/* BrowserStack:sessionMapping */ sessions) {
        this.onBrowserComplete = (browser) => logger.session(sessions[browser.id]);
      }
    ]
  });

  config.set({
    browsers: Object.keys(customLaunchers),
    customLaunchers: customLaunchers,
    browserDisconnectTimeout: 3e5,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 3e5,
    captureTimeout: 3e5,
    junitReporter: {
      outputDir: path.join(process.cwd(), 'test-results')
    },
    browserStack: {
      port: 9876,
      pollingTimeout: 10000,
      username: args.bsUser,
      accessKey: args.bsKey
    }
  });
}

module.exports = getConfig;
