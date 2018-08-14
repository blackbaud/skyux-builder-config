/*jshint node: true*/
'use strict';

const path = require('path');
const minimist = require('minimist');
const shared = require('@blackbaud/skyux-builder/config/karma/test.karma.conf');
const logger = require('@blackbaud/skyux-logger');
const browserUtils = require('../utils/browsers');

// Needed since we bypass Karma cli
const args = minimist(process.argv.slice(2));

/**
 * Gets any custom defined browsers and converts them to launchers.
 * @param {*} config
 */
function getLaunchers(config) {
  const browsers = browserUtils.getBrowsers(config, 'unit', {
    base: 'BrowserStack',
    name: 'skyux test',
    build: args.buildNumber,
    project: args.buildDefinitionName
  });

  // Karma needs object with key/value pairs.
  if (browsers && browsers.length) {
    const launchers = {};
    browsers.forEach(browser => launchers[browser.key] = browser);
    return launchers;
  }
}

/**
 * VSTS platform overrides.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {

  // Apply defaults, needed first so we can read skyPagesConfig
  shared(config);

  // For backwards compatability, Karma overwrites arrays
  config.reporters.push('junit');
  config.coverageReporter.reporters.push({
    type: 'cobertura'
  });

  // These are general VSTS overrides, regardless of Browserstack
  const overrides = {
    browserDisconnectTimeout: 6e5,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 6e5,
    captureTimeout: 6e5,
    junitReporter: {
      outputDir: path.join(process.cwd(), 'test-results')
    },

    // VSTS doesn't render default symbols well.
    mochaReporter: {
      symbols: {
        success: '+',
        info: '#',
        warning: '!',
        error: 'x'
      }
    }
  };

  // Only override certain properties if there are customLaunchers
  const launchers = getLaunchers(config);
  if (launchers) {
    overrides.customLaunchers = launchers;
    overrides.browsers = Object.keys(launchers);
    overrides.browserStack = {
      port: 9876,
      pollingTimeout: 10000,
      timeout: 600,
      username: args.bsUser,
      accessKey: args.bsKey,
      enableLoggingForApi: true
    };

    // Custom plugin used to read the Browserstack session
    // Pushing to the original config since arrays aren't merged.
    config.reporters.push('blackbaud-browserstack');
    config.plugins.push({
      'reporter:blackbaud-browserstack': [
        'type',
        function (/* BrowserStack:sessionMapping */ sessions) {
          this.onBrowserComplete = (browser) => browserUtils.logSession(sessions[browser.id]);
        }
      ]
    });
  }

  config.set(overrides);
  logger.verbose(config);
}

module.exports = getConfig;
