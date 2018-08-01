/*jshint node: true*/
'use strict';

const minimist = require('minimist');
const shared = require('../../../shared/karma/shared.karma.conf');

// Needed since we bypass Karma cli
const args = minimist(process.argv.slice(2));

/**
 * VSTS platform overrides.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {
  shared(config, {
    BROWSER_STACK_USERNAME: args.bsUser,
    BROWSER_STACK_ACCESS_KEY: args.bsKey,
    BROWSER_STACK_BUILD_ID: args.buildNumber,
    BROWSER_STACK_PROJECT: args.buildDefinitionName
  });
}

module.exports = getConfig;
