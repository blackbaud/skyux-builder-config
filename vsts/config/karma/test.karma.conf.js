/*jshint node: true*/
'use strict';

const path = require('path');
const minimist = require('minimist');
const applySharedConfig = require('../../../shared/karma/shared.karma.conf');
const { printSessionResults } = require('../utils/session-logger');

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
      name: 'skyux test',
      build: args.buildNumber,
      project: args.buildDefinitionName
    }
  };

  applySharedConfig(config);

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
        this.onBrowserComplete = (browser) => printSessionResults(sessions[browser.id]);
      }
    ]
  });

  config.set({
    browsers: Object.keys(customLaunchers),
    customLaunchers: customLaunchers,
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
  });

  config.browserStack.username = args.bsUser;
  config.browserStack.accessKey = args.bsKey;
}

module.exports = getConfig;
