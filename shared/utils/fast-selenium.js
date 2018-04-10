/* jshint node: true */
'use strict';

// This file is a direct copy of:
// https://github.com/browserstack/fast-selenium-scripts/blob/master/node/fast-selenium.js

const http = require('http');
const https = require('https');

const keepAliveTimeout = 30 * 1000;

if (http.globalAgent && http.globalAgent.hasOwnProperty('keepAlive')) {
  http.globalAgent.keepAlive = true;
  https.globalAgent.keepAlive = true;
  http.globalAgent.keepAliveMsecs = keepAliveTimeout;
  https.globalAgent.keepAliveMsecs = keepAliveTimeout;
} else {
  const agent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: keepAliveTimeout
  });

  const secureAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: keepAliveTimeout
  });

  const httpRequest = http.request;
  const httpsRequest = https.request;

  http.request = function (options, callback) {
    if (options.protocol === 'https:') {
      options.agent = secureAgent;
      return httpsRequest(options, callback);
    } else {
      options.agent = agent;
      return httpRequest(options, callback);
    }
  };
}