/*jshint node: true*/
'use strict';

const logger = require('@blackbaud/skyux-logger');

function printSessionResults(session) {
  logger.info(
`


****************************************************************************************************
Visit the following URL to view your Browserstack results:
https://host.nxt.blackbaud.com/browserstack/sessions/${session}
****************************************************************************************************

`
  );
}

module.exports = {
  printSessionResults
};
