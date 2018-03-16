/*jshint jasmine: true, node: true */
'use strict';

const BrowserstackLocal = require('browserstack-local');
const { SpecReporter } = require('jasmine-spec-reporter');
const logger = require('../../../utils/logger');

// Include the "fast selenium" side effect.
// https://www.browserstack.com/automate/node#add-on
require('hub-utility/keep-alive');

// This is what ties the tests to the local tunnel that's created
const id = 'skyux-spa-' + (new Date()).getTime();

let { config } = require('@blackbaud/skyux-builder/config/protractor/protractor.conf');

// We rely on the builtin support of BrowserStack by setting browserstackUser/browserstackKey.
// If we didn't, java would still be considered a requirement.
config = Object.assign(config, {
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
    browser_version: '57',
    os: 'OS X',
    os_version: 'El Capitan',
    build: `skyux-mac-chrome-webdriver-${process.env.TRAVIS_BUILD_NUMBER}`,
    resolution: '1280x960',
    name: 'skyux visual',
    acceptSslCerts: true,
    'browserstack.user': process.env.BROWSER_STACK_USERNAME,
    'browserstack.key': process.env.BROWSER_STACK_ACCESS_KEY,
    'browserstack.local': 'true',
    'browserstack.debug': 'true',
    'browserstack.localIdentifier': id
  },

  // Used to open the Browserstack tunnel
  beforeLaunch: () => {
    require('ts-node').register({ ignore: false });

    return new Promise((resolve, reject) => {
      const bsConfig = {
        user: process.env.BROWSER_STACK_USERNAME,
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
    jasmine.getEnv().addReporter(new SpecReporter());

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
