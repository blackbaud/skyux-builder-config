/*jshint jasmine: true, node: true */
/*global browser*/
'use strict';

const common = require('@blackbaud/skyux-builder/config/protractor/protractor.conf');
const merge = require('@blackbaud/skyux-builder/utils/merge');
const logger = require('@blackbaud/skyux-logger');

// Include the "fast selenium" side effect.
// https://www.browserstack.com/automate/node#add-on
require('../utils/fast-selenium');

function getConfig() {
  const config = merge(common.config, {
    onPrepare: function () {
      require('ts-node').register({ ignore: false });

      // Attach config to the browser object to allow the
      // `@skyux-sdk/e2e` library to access it for visual tests.
      browser.skyE2E = require('./e2e-config')();
    }
  });

  logger.verbose(config);

  return config;
}

module.exports = getConfig;
