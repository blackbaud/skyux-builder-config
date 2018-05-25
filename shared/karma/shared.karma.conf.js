/* jshint node: true */
'use strict';

const applySharedBuilderConfig = require('@blackbaud/skyux-builder/config/karma/shared.karma.conf');

function getConfig(config) {
  applySharedBuilderConfig(config);

  config.set({
    browserDisconnectTimeout: 6e5,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 6e5,
    captureTimeout: 6e5,
    browserStack: {
      enableLoggingForApi: true,
      port: 9876,
      pollingTimeout: 10000,
      timeout: 600
    }
  });
}

module.exports = getConfig;
