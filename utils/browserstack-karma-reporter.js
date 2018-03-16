const logger = require('./logger');

function applyBrowserstackKarmaReporter(config) {
  // Custom plugin used to read the Browserstack session
  config.reporters.push('blackbaud-browserstack');
  config.plugins.push({
    'reporter:blackbaud-browserstack': [
      'type',
      function (/* BrowserStack:sessionMapping */ sessions) {
        this.onBrowserComplete = (browser) => logger.session(sessions[browser.id]);
      }
    ]
  });
}

module.exports = {
  applyBrowserstackKarmaReporter
};