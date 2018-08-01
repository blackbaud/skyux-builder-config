/*jshint node: true*/
'use strict';

const logger = require('@blackbaud/skyux-logger');
const get = require('lodash.get');

const bsBrowserChrome = {
  os: 'Windows',
  osVersion: '10',
  browser: 'Chrome'
};

const bsBrowserEdge = {
  os: 'Windows',
  osVersion: '10',
  browser: 'Edge'
};

const bsBrowserIE = {
  os: 'Windows',
  osVersion: '7',
  browser: 'IE',
  browserVersion: '11'
};

const bsBrowserFirefox = {
  os: 'OS X',
  osVersion: 'High Sierra',
  browser: 'Firefox'
};

const bsBrowserSafari = {
  os: 'OS X',
  osVersion: 'High Sierra',
  browser: 'Safari'
};

const browserSets = {
  speedy: [
    bsBrowserChrome
  ],
  quirky: [
    bsBrowserChrome,
    bsBrowserEdge,
    bsBrowserIE
  ],
  paranoid: [
    bsBrowserChrome,
    bsBrowserEdge,
    bsBrowserIE,
    bsBrowserFirefox,
    bsBrowserSafari
  ]
};

// We normalize properties despite Browserstack/Protractor/Karma using different keys.
// Leaving this functionality in case we expose the e2e property in the future.
const propertiesMap = {
  e2e: {
    osVersion: 'os_version',
    browser: 'browserName',
    browserVersion: 'browser_version',
  },
  unit: {
    osVersion: 'os_version',
    browserVersion: 'browser_version',
  }
};

function validateBrowserSet(configBrowserSet) {
  if (configBrowserSet) {
    logger.info(`Attempting to use config setting ${configBrowserSet}.`);
    const validBrowserSetKeys = Object.keys(browserSets);
    const browserSetKeyIndex = validBrowserSetKeys.indexOf(configBrowserSet.toLowerCase());

    if (browserSetKeyIndex > -1) {
      logger.info(`Validated config setting ${configBrowserSet}.`);
      return validBrowserSetKeys[browserSetKeyIndex];
    }
  }
}

module.exports = {
  getBrowsers: (config, testSuite, defaults) => {

    const configBrowserSetRequsted = get(
      config,
      `skyPagesConfig.skyux.testSettings.${testSuite}.browserSet`,
      ''
    );
    const configBrowserSetValidated = validateBrowserSet(configBrowserSetRequsted);
    const allowedPropertiesMap = propertiesMap[testSuite];
    const allowedPropertiesKeys = Object.keys(allowedPropertiesMap);

    // browserSet was either not provided, or was provided but was invalid.
    const browsers = configBrowserSetValidated ? browserSets[configBrowserSetValidated] : [];

    return browsers.map(browser => {

      // Copies properties so we don't alter original.
      // Creates a unique key
      const browserMapped = Object.assign({}, browser, {
        key: [
          browser.os || 'osDefault',
          browser.osVersion || 'osVersionDefault',
          browser.browser || 'browserDefault',
          browser.browserVersion || 'browserVersionDefault'
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
};
