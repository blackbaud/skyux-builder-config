/*jshint node: true*/
'use strict';

const path = require('path');
const minimist = require('minimist');
const shared = require('@blackbaud/skyux-builder/config/karma/shared.karma.conf');
const { applyBrowserstackKarmaReporter } = require('../../../utils/browserstack-karma-reporter');

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

  // Apply defaults
  shared(config);
  applyBrowserstackKarmaReporter(config);

  // For backwards compatability, Karma overwrites arrays
  config.reporters.push('junit');
  config.coverageReporter.reporters.push({
    type: 'cobertura'
  });

  config.set({
    browsers: Object.keys(customLaunchers),
    customLaunchers: customLaunchers,
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
