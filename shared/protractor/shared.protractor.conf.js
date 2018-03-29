/* jshint jasmine: true, node: true */
'use strict';

const BrowserstackLocal = require('browserstack-local');
const common = require('@blackbaud/skyux-builder/config/protractor/protractor.conf');
const merge = require('@blackbaud/skyux-builder/utils/merge');
const logger = require('@blackbaud/skyux-logger');

// Include the "fast selenium" side effect.
// https://www.browserstack.com/automate/node#add-on
require('../utils/fast-selenium');

function getConfig(options) {

  // This is what ties the tests to the local tunnel that's created.
  const currentTime = new Date().getTime();
  const id = `skyux-spa-${currentTime}`;

  // We rely on the builtin support of BrowserStack by setting browserstackUser/browserstackKey.
  // If we didn't, java would still be considered a requirement.
  const config = merge(common.config, {
    browserstackUser: options.browserstackUser,
    browserstackKey: options.browserstackKey,
    directConnect: false,
    capabilities: {
      acceptSslCerts: true,
      build: options.capabilities.build,
      resolution: '1280x960',
      'browserstack.local': true,
      'browserstack.networkLogs': true,
      'browserstack.debug': true,
      'browserstack.user': options.browserstackUser,
      'browserstack.key': options.browserstackKey,
      'browserstack.localIdentifier': id
    },

    // Used to open the Browserstack tunnel
    beforeLaunch() {
      require('ts-node').register({ ignore: false });

      const bsConfig = {
        user: options.browserstackUser,
        key: options.browserstackKey,
        onlyAutomate: true,
        forceLocal: true,
        force: true,
        localIdentifier: id,
        verbose: true
      };

      return new Promise((resolve, reject) => {
        logger.info('Attempting to connect to Browserstack...');
        exports.bsLocal = new BrowserstackLocal.Local();
        exports.bsLocal.start(bsConfig, (err) => {
          if (err) {
            logger.error('Error connecting to Browserstack!');
            reject(err);
          } else {
            logger.info('Connected to Browserstack.');
            resolve();
          }
        });
      });
    },

    // Used to close the Browserstack tunnel
    afterLaunch: () => new Promise(resolve => {
      if (exports.bsLocal) {
        logger.info('Closing Browserstack connection.');
        exports.bsLocal.stop(resolve);
      } else {
        logger.info('Not connected to Browserstack.  Nothing to close.');
        resolve();
      }
    })
  });

  return config;
}

module.exports = {
  getConfig
};