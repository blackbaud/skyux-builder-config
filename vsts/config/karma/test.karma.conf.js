/*jshint node: true*/
'use strict';

const path = require('path');
const minimist = require('minimist');
const shared = require('@blackbaud/skyux-builder/config/karma/test.karma.conf');
const logger = require('../utils/logger');

// Needed since we bypass Karma cli
const args = minimist(process.argv.slice(2));

/**
 * Verifies if any custom browsers are defined
 * @param {*} config
 */
function getBrowsers(config) {
  if (config
    && config.skyPagesConfig
    && config.skyPagesConfig.skyux.testSettings
    && config.skyPagesConfig.skyux.testSettings.unit
    && config.skyPagesConfig.skyux.testSettings.unit.browsers
    && config.skyPagesConfig.skyux.testSettings.unit.browsers.length) {
      return config.skyPagesConfig.skyux.testSettings.unit.browsers;
    }
}

/**
 * Assumes custom browsers exist, apply our default properties to them.
 * Basically, converts the browsers to launchers.
 * @param {*} customBrowsers
 */
function getLaunchers(browsers) {
  const launchers = {};

  const browserstackMap = {
    'os': 'os',
    'osVersion': 'os_version',
    'browser': 'browser',
    'browserVersion': 'browser_version'
  };

  const browserstackKeys = Object.keys(browserstackMap);

  browsers.forEach(browser => {
    const browserKey = [
      browser.os || 'default',
      browser.osVersion || 'default',
      browser.browser || 'default',
      browser.browserVersion || 'default'
    ].join('_');

    launchers[browserKey] = {
      base: 'BrowserStack',
      name: 'skyux test',
      build: args.buildNumber,
      project: args.buildDefinitionName
    };

    browserstackKeys.forEach(key => {
      if (browser[key]) {
        launchers[browserKey][browserstackMap[key]] = browser[key];
      }
    });
  });

  return launchers;
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

  // Only override "browsers" property if there are customLaunchers
  const browsers = getBrowsers(config);
  if (browsers) {
    overrides.customLaunchers = getLaunchers(browsers);
    overrides.browsers = Object.keys(overrides.customLaunchers);
    overrides.browserstack = {
      port: 9876,
      pollingTimeout: 10000,
      timeout: 600,
      username: args.bsUser,
      accessKey: args.bsKey,
      enableLoggingForApi: true
    };
  }

  config.set(overrides);
}

module.exports = getConfig;
