/*jshint jasmine: true, node: true */
/*global browser*/
'use strict';

const minimist = require('minimist');
const merge = require('@blackbaud/skyux-builder/utils/merge');
const sharedConfig = require('../../../shared/protractor/shared.protractor.conf');
const sessionLogger = require('../utils/session-logger');

// Needed since we bypass Protractor CLI.
const args = minimist(process.argv.slice(2));

const config = sharedConfig.getConfig({
  browserstackUser: args.bsUser,
  browserstackKey: args.bsKey
});

exports.config = merge(config, {
  capabilities: {
    os: 'Windows',
    os_version: '10',
    name: 'skyux e2e',
    build: args.buildNumber,
    project: args.buildDefinitionName
  },

  // Used to grab the Browserstack session
  onPrepare() {
    return browser.driver
      .getSession()
      .then(session => sessionLogger.printSessionResults(session.getId()));
  }
});
