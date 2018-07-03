/*jshint node: true*/
'use strict';

const logger = require('@blackbaud/skyux-logger');
const get = require('lodash.get');

// We normalize properties despite Browserstack/Protractor/Karma using different keys.
const map = {
  'e2e': {
    os: 'os',
    osVersion: 'os_version',
    browser: 'browserName',
    browserVersion: 'browser_version',
    device: 'device'
  },
  'unit': {
    os: 'os',
    osVersion: 'os_version',
    browser: 'browser',
    browserVersion: 'browser_version',
    device: 'device'
  }
};

module.exports = {
  getBrowsers: (config, testSuite, defaults) => {

    const browsers = get(config, `skyPagesConfig.skyux.testSettings.${testSuite}.browsers`, []);
    const allowedPropertiesMap = map[testSuite];
    const allowedPropertiesKeys = Object.keys(allowedPropertiesMap);

    return browsers.map(browser => {

      // Copies properties do we don't alter original.
      // Creates a unique key
      const browserMapped = Object.assign({}, browser, {
        key: [
          browser.os || 'default',
          browser.osVersion || 'default',
          browser.browser || 'default',
          browser.browserVersion || 'default'
        ].join('_')
      }, defaults);

      // Copies the allowed properties to their mapped values.
      // Deletes the original property.
      allowedPropertiesKeys.forEach(key => {
        if (browserMapped[key]) {
          browserMapped[allowedPropertiesMap[key]] = browserMapped[key];
          delete browserMapped[key];
        }
      });

      return browserMapped;
    });
  },

  logSession: (session) => {
    logger.info(
`


****************************************************************************************************
Visit the following URL to view your Browserstack results:
https://host.nxt.blackbaud.com/browserstack/sessions/${session}
****************************************************************************************************

`
    );
  }
}
