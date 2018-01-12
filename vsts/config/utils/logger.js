/*jshint node: true*/
'use strict';

module.exports = {
  session: (session) => {
    console.log(
`


****************************************************************************************************
Visit the following URL to view your Browserstack results:
https://host.nxt.blackbaud.com/browserstack/sessions/${session}
****************************************************************************************************

`
    );
  }
};
