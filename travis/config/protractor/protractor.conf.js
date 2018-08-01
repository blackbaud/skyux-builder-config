/*jshint jasmine: true, node: true */
'use strict';

const getConfig = require('../../../shared/protractor/shared.protractor.conf');

const config = getConfig({
  BROWSER_STACK_USERNAME: process.env.BROWSER_STACK_USERNAME,
  BROWSER_STACK_ACCESS_KEY: process.env.BROWSER_STACK_ACCESS_KEY,
  BROWSER_STACK_BUILD_ID: process.env.TRAVIS_BUILD_NUMBER,
  BROWSER_STACK_PROJECT: 'SKY UX Travis CI: Protractor'
});

exports.config = config;
