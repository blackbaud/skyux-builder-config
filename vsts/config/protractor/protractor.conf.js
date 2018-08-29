/*jshint jasmine: true, node: true */
'use strict';

const minimist = require('minimist');
const getConfig = require('../../../shared/protractor/shared.protractor.conf');

// Needed since we bypass Protractor cli
const args = minimist(process.argv.slice(2));

const config = getConfig({
  BROWSER_STACK_USERNAME: args.bsUser,
  BROWSER_STACK_ACCESS_KEY: args.bsKey,
  BROWSER_STACK_BUILD_ID: args.buildNumber,
  BROWSER_STACK_PROJECT: args.buildDefinitionName
});

exports.config = config;
