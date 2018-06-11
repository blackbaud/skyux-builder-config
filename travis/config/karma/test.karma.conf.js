/* jshint node: true */
'use strict';

const applySharedConfig = require('../../../shared/karma/shared.karma.conf');

function getConfig(config) {

  const customLaunchers = {
    bs_windows_ie_11: {
      base: 'BrowserStack',
      browser: 'ie',
      browser_version: '11.0',
      os: 'Windows',
      os_version: '10'
    },
    bs_windows_edge: {
      base: 'BrowserStack',
      browser: 'edge',
      os: 'Windows',
      os_version: '10'
    },
    bs_windows_chrome_latest: {
      base: 'BrowserStack',
      browser: 'chrome',
      os: 'Windows',
      os_version: '8.1'
    },
    bs_windows_firefox_latest: {
      base: 'BrowserStack',
      browser: 'firefox',
      os: 'Windows',
      os_version: '8.1'
    },
    bs_osx_safari_latest: {
      base: 'BrowserStack',
      browser: 'safari',
      os: 'OS X',
      os_version: 'Sierra'
    },
    bs_osx_chrome_latest: {
      base: 'BrowserStack',
      browser: 'chrome',
      os: 'OS X',
      os_version: 'Sierra'
    },
    bs_osx_firefox_latest: {
      base: 'BrowserStack',
      browser: 'firefox',
      os: 'OS X',
      os_version: 'Sierra'
    }
  };

  applySharedConfig(config);

  config.set({
    browsers: Object.keys(customLaunchers),
    customLaunchers: customLaunchers
  });

  config.browserStack.username = process.env.BROWSER_STACK_USERNAME;
  config.browserStack.accessKey = process.env.BROWSER_STACK_ACCESS_KEY;
}

module.exports = getConfig;
