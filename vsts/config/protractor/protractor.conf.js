/*jshint jasmine: true, node: true */
/*global browser*/
'use strict';

const BrowserstackLocal = require('browserstack-local');
const minimist = require('minimist');
const common = require('@blackbaud/skyux-builder/config/protractor/protractor.conf');
const merge = require('@blackbaud/skyux-builder/utils/merge');
const logger = require('../utils/logger');

// Needed since we bypass Protractor cli
const args = minimist(process.argv.slice(2));

// This is what ties the tests to the local tunnel that's created
const id = 'skyux-spa-' + (new Date()).getTime();

/**
 * Verifies if any custom browsers are defined
 * @param {*} config
 */
function getBrowsers(config) {
  if (config
    && config.skyPagesConfig
    && config.skyPagesConfig.skyux.testSettings
    && config.skyPagesConfig.skyux.testSettings.e2e
    && config.skyPagesConfig.skyux.testSettings.e2e.browsers
    && config.skyPagesConfig.skyux.testSettings.e2e.browsers.length) {
      return config.skyPagesConfig.skyux.testSettings.e2e.browsers;
    }
}

/**
 * Assumes custom browsers exist, apply our default properties to them.
 * Basically, converts the browsers to capabilities.
 * @param {*} customBrowsers
 */
function getCapabilities(browsers) {

  // We normalize properties between e2e/unit settings, but Browserstack needs them differently.
  const browserstackMap = {
    'os': 'os',
    'osVersion': 'os_version',
    'browser': 'browserName',
    'browserVersion': 'browser_version'
  };

  const browserstackKeys = Object.keys(browserstackMap);

  return browsers.map(capabilitiy => {
    const capabilitiesMapped = {
      name: 'skyux e2e',
      build: args.buildNumber,
      project: args.buildDefinitionName,
      'browserstack.localIdentifier': id,
      'browserstack.local': true,
      'browserstack.networkLogs': true,
      'browserstack.debug': true,
      'browserstack.enable-logging-for-api': true
    };
    
    browserstackKeys.forEach(key => {
      if (capabilitiy[key]) {
        capabilitiesMapped[browserstackMap[key]] = capabilitiy[key];
      }
    });

    return capabilitiesMapped;
  });
}

let overrides = {};

// We rely on the builtin support of BrowserStack by setting browserstackUser/browserstackKey.
// If we didn't, java would still be considered a requirement.
const browsers = getBrowsers(common.config);

// In the case of e2e, there's nothing we need to override for VSTS that's not specific to BS.
if (browsers) {
  overrides = {
    browserstackUser: args.bsUser,
    browserstackKey: args.bsKey,
    directConnect: false,
    capabilities: getCapabilities(browsers),

    // Used to open the Browserstack tunnel
    beforeLaunch: () => {
      require('ts-node').register({ ignore: false });
      return new Promise((resolve, reject) => {
        const bsConfig = {
          key: args.bsKey,
          onlyAutomate: true,
          forceLocal: true,
          force: true,
          localIdentifier: id,
          verbose: true,
          'enable-logging-for-api': true
        };

        console.log('Attempting to connect to Browserstack.');
        exports.bsLocal = new BrowserstackLocal.Local();
        exports.bsLocal.start(bsConfig, (err) => {
          if (err) {
            console.error('Error connecting to Browserstack.');
            reject(err);
          } else {
            console.log('Connected to Browserstack.  Beginning e2e tests.');
            resolve();
          }
        });
      });
    },

    // Used to grab the Browserstack session
    onPrepare: () => new Promise((resolve, reject) => {
      browser
        .driver
        .getSession()
        .then(session => {
          logger.session(session.getId());
          resolve();
        })
        .catch(reject);
    }),

    // Used to close the Browserstack tunnel
    afterLaunch: () => new Promise((resolve) => {
      if (exports.bsLocal) {
        console.log('Closing Browserstack connection.');
        exports.bsLocal.stop(resolve);
      } else {
        console.log('Not connected to Browserstack.  Nothing to close.');
        resolve();
      }
    })
  };
}

const config = merge(common.config, overrides);
exports.config = config;
