/*jshint jasmine: true, node: true */
/*global browser*/
'use strict';

const path = require('path');
const PixDiff = require('pix-diff');
const { SpecReporter } = require('jasmine-spec-reporter');
const { config } = require('./protractor.conf');

config.specs = [
  path.join(process.cwd(), '**', '*.visual-spec.ts')
];

config.capabilities.resolution = '1280x960';

config.onPrepare = function () {
  jasmine.getEnv().addReporter(new SpecReporter());

  browser.skyVisualTestConfig = {
    basePath: 'screenshots-baseline',
    diffPath: 'screenshots-diff',
    createdPath: 'screenshots-created',
    createdPathDiff: 'screenshots-created-diff',
    baseline: true,
    width: 1000,
    height: 800
  };

  browser.pixDiff = new PixDiff(browser.skyVisualTestConfig);
};

exports.config = config;
