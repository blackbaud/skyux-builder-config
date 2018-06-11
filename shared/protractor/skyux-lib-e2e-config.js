/*jshint jasmine: true, node: true */
'use strict';

module.exports = function () {
  return {
    visualConfig: {
      compareScreenshot: {
        basePath: 'screenshots-baseline',
        diffPath: 'screenshots-diff',
        createdPath: 'screenshots-created',
        createdPathDiff: 'screenshots-created-diff',
        baseline: true,
        width: 1000,
        height: 800
      }
    }
  };
};