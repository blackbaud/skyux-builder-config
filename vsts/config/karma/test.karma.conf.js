/*jshint node: true*/
'use strict';

const path = require('path');
const minimist = require('minimist');
const shared = require('@blackbaud/skyux-builder/config/karma/shared.karma.conf');
const logger = require('../utils/logger');

// Needed since we bypass Karma cli
const args = minimist(process.argv.slice(2));

/**
 * Applies the default properties.
 */
function applyDefaults(custom) {
  const shared = {
    base: 'BrowserStack',
    name: 'skyux test',
    build: args.buildNumber,
    project: args.buildDefinitionName
  };

  Object.keys(custom)
    .forEach(key => shared[key] = custom[key]);

  return shared;
}

/**
 * VSTS platform overrides.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {

  // https://www.browserstack.com/automate/protractor#configure-capabilities
  const customLaunchers = {
    bs_windows_chrome_latest: applyDefaults({
      browser: 'chrome',
      os: 'Windows',
      os_version: '10'
    }),
    bs_windows_ie_latest: applyDefaults({
      browser: 'ie',
      browser_version: '11',
      os: 'Windows',
      os_version: '10'
    })
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
