/*jshint jasmine: true, node: true */
'use strict';

const BrowserstackLocal = require('browserstack-local');
// const minimist = require('minimist');
const common = require('@blackbaud/skyux-builder/config/protractor/visual.protractor.conf');
const merge = require('@blackbaud/skyux-builder/utils/merge');
const PixDiff = require('pix-diff');
const logger = require('../../../utils/logger');

const getVisualTestConfig = (suffix) => {
  const config = {
    basePath: 'screenshots-baseline',
    diffPath: 'screenshots-diff',
    createdPath: 'screenshots-created',
    createdPathDiff: 'screenshots-created-diff',
    baseline: true,
    width: 1000,
    height: 800
  };

  if (suffix) {
    config.basePath += `-${suffix}`;
    config.diffPath += `-${suffix}`;
    config.createdPath += `-${suffix}`;
    config.createdPathDiff += `-${suffix}`;
  }

  return config;
};

// Needed since we bypass Protractor cli
// const args = minimist(process.argv.slice(2));

// This is what ties the tests to the local tunnel that's created
const id = 'skyux-spa-' + (new Date()).getTime();

// We rely on the builtin support of BrowserStack by setting browserstackUser/browserstackKey.
// If we didn't, java would still be considered a requirement.
const config = merge(common.config, {
  browserstackUser: process.env.BROWSER_STACK_USERNAME,
  browserstackKey: process.env.BROWSER_STACK_ACCESS_KEY,
  directConnect: false,
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': [
        '--disable-extensions',
        '--ignore-certificate-errors'
      ]
    },
    'browserstack.user': process.env.BROWSER_STACK_USERNAME,
    'browserstack.key': process.env.BROWSER_STACK_ACCESS_KEY,
    browser_version: '57',
    'browserstack.local': 'true',
    'browserstack.debug': 'true',
    os: 'OS X',
    os_version: 'El Capitan',
    build: `skyux-mac-chrome-webdriver-${process.env.TRAVIS_BUILD_NUMBER}`,
    resolution: '1280x960',
    name: 'skyux visual',
    'browserstack.localIdentifier': id,
    'acceptSslCerts': true
  },

  // Used to open the Browserstack tunnel
  beforeLaunch: () => {
    require('ts-node').register({ ignore: false });

    return new Promise((resolve, reject) => {
      const bsConfig = {
        key: process.env.BROWSER_STACK_ACCESS_KEY,
        onlyAutomate: true,
        forceLocal: true,
        force: true,
        localIdentifier: id,
        verbose: true
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
    // browser.params.chunks = JSON.parse(browser.params.chunks);
    // browser.params.skyPagesConfig = JSON.parse(browser.params.skyPagesConfig);
    browser.skyVisualTestConfig = getVisualTestConfig();
    browser.pixDiff = new PixDiff(browser.skyVisualTestConfig);

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
});

exports.config = config;
