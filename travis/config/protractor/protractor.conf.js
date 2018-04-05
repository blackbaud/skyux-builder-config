/*jshint jasmine: true, node: true */
'use strict';

const merge = require('@blackbaud/skyux-builder/utils/merge');
const { SpecReporter } = require('jasmine-spec-reporter');
const sharedConfig = require('../../../shared/protractor/shared.protractor.conf');

const config = sharedConfig.getConfig({
  browserstackUser: process.env.BROWSER_STACK_USERNAME,
  browserstackKey: process.env.BROWSER_STACK_ACCESS_KEY
});

exports.config = merge(config, {
  capabilities: {
    browserName: 'chrome',
    browser_version: '57',
    chromeOptions: {
      'args': [
        '--disable-extensions',
        '--ignore-certificate-errors'
      ]
    },
    os: 'OS X',
    os_version: 'El Capitan',
    name: 'skyux visual',
    build: `skyux-mac-chrome-webdriver-${process.env.TRAVIS_BUILD_NUMBER}`
  },

  onPrepare() {
    jasmine.getEnv().addReporter(new SpecReporter());
  }
});
