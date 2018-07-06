/*jshint jasmine: true, node: true */
/*global browser*/
'use strict';

const BrowserstackLocal = require('browserstack-local');
const minimist = require('minimist');
const common = require('@blackbaud/skyux-builder/config/protractor/protractor.conf');
const merge = require('@blackbaud/skyux-builder/utils/merge');
const logger = require('@blackbaud/skyux-logger');
const browserUtils = require('../utils/browsers');

// Needed since we bypass Protractor cli
const args = minimist(process.argv.slice(2));

// This is what ties the tests to the local tunnel that's created
const id = 'skyux-spa-' + (new Date()).getTime();

/**
 * Gets any custom defined browsers.
 * @param {*} config
 */
function getCapabilities(config) {
  return browserUtils.getBrowsers(config, 'e2e', {
    name: 'skyux e2e',
    build: args.buildNumber,
    project: args.buildDefinitionName,
    acceptSslCerts: true,
    'browserstack.localIdentifier': id,
    'browserstack.local': true,
    'browserstack.networkLogs': true,
    'browserstack.debug': true,
    'browserstack.console': 'verbose',
    'browserstack.enable-logging-for-api': true,
  });
}

let overrides = {};
const capabilities = getCapabilities(common.config);

// In the case of e2e, there's nothing we need to override for VSTS that's not specific to BS.
if (capabilities && capabilities.length) {

  overrides = {
    // We rely on the builtin support of BrowserStack by setting browserstackUser/browserstackKey.
    // If we didn't, java would still be considered a requirement.
    browserstackUser: args.bsUser,
    browserstackKey: args.bsKey,
    directConnect: false,
    capabilities: null,
    multiCapabilities: capabilities,

    // Used to open the Browserstack tunnel
    beforeLaunch: () => new Promise((resolve, reject) => {
      const bsConfig = {
        key: args.bsKey,
        onlyAutomate: true,
        forceLocal: true,
        force: true,
        localIdentifier: id,
        verbose: true,
        'enable-logging-for-api': true
      };

      logger.info('Attempting to connect to Browserstack.');
      exports.bsLocal = new BrowserstackLocal.Local();
      exports.bsLocal.start(bsConfig, (err) => {
        if (err) {
          logger.error('Error connecting to Browserstack.');
          reject(err);
        } else {
          logger.info('Connected to Browserstack.  Beginning e2e tests.');
          resolve();
        }
      });
    }),

    // Used to grab the Browserstack session
    onPrepare: () => new Promise((resolve, reject) => {
      require('ts-node').register({ ignore: false });
      browser
        .driver
        .getSession()
        .then(session => {
          browserUtils.logSession(session.getId());
          resolve();
        })
        .catch(reject);
    }),

    // Used to close the Browserstack tunnel
    afterLaunch: () => new Promise((resolve) => {
      if (exports.bsLocal) {
        logger.info('Closing Browserstack connection.');
        exports.bsLocal.stop(resolve);
      } else {
        logger.info('Not connected to Browserstack.  Nothing to close.');
        resolve();
      }
    })
  };
}

const config = merge(common.config, overrides);
logger.verbose(config);

exports.config = config;
