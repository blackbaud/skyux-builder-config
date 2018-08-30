/* jshint node: true */
'use strict';

const spawn = require('cross-spawn');

function dirHasChanges(dir) {
  return exec('git', ['status', dir, '--porcelain'])
    .then((result) => {
      // Untracked files are prefixed with '??'
      // https://git-scm.com/docs/git-status/1.8.1#_output
      // https://stackoverflow.com/a/6978402/6178885
      return !!(result && result.indexOf('??') > -1);
    });
}

function exec(cmd, args, opts) {
  const cp = spawn(cmd, args, opts);

  return new Promise((resolve, reject) => {
    let output;
    cp.stdout.on('data', (data) => {
      output = data.toString('utf8');
    });

    let error;
    cp.stderr.on('data', (data) => {
      error = data.toString('utf8');
    });

    cp.on('error', (err) => {
      reject(err);
    });

    cp.on('exit', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(error);
      }
    });
  });
}

module.exports = {
  dirHasChanges,
  exec
};
