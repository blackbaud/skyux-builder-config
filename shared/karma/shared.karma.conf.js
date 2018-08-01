/* jshint node: true */
'use strict';

const applySharedBuilderConfig = require('@blackbaud/skyux-builder/config/karma/shared.karma.conf');
const logger = require('@blackbaud/skyux-logger');
const path = require('path');
const browserUtils = require('../utils/browsers');

/**
 * Gets any custom defined browsers and converts them to launchers.
 * @param {*} config
 */
function getLaunchers(config, env) {
  const browsers = browserUtils.getBrowsers(config, 'unit', {
    base: 'BrowserStack',
    name: 'skyux test',
    build: env.BROWSER_STACK_BUILD_ID,
    project: env.BROWSER_STACK_PROJECT
  });

  // Karma needs object with key/value pairs.
  if (browsers && browsers.length) {
    const launchers = {};
    browsers.forEach(browser => launchers[browser.key] = browser);
    return launchers;
  }
}

function getConfig(config, env) {

  if (!env.BROWSER_STACK_USERNAME) {
    throw Error('Please provide a BrowserStack username!');
  }

  if (!env.BROWSER_STACK_ACCESS_KEY) {
    throw new Error('Please provide a BrowserStack access key!');
  }

  // Apply defaults, needed first so we can read skyPagesConfig
  applySharedBuilderConfig(config);

  // For backwards compatability, Karma overwrites arrays
  config.reporters.push('junit');
  config.coverageReporter.reporters.push({
    type: 'cobertura'
  });

  // These are general VSTS overrides, regardless of Browserstack
  const overrides = {
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
    },

    browserDisconnectTimeout: 6e5,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 6e5,
    captureTimeout: 6e5,
    browserStack: {
      enableLoggingForApi: true,
      port: 9876,
      pollingTimeout: 10000,
      timeout: 600
    }
  };

  // Only override certain properties if there are customLaunchers
  const launchers = getLaunchers(config, env);
  if (launchers) {
    overrides.customLaunchers = launchers;
    overrides.browsers = Object.keys(launchers);
    overrides.browserStack = {
      username: env.BROWSER_STACK_USERNAME,
      accessKey: env.BROWSER_STACK_ACCESS_KEY
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