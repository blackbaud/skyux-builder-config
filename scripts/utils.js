/* jshint node: true */
'use strict';

const spawn = require('cross-spawn');

function dirHasChanges(dir) {
  return exec('git', ['status', dir, '--porcelain'])
    .then((output) => {
      if (!output) {
        return false;
      }

      const result = output.trim();

      // Untracked files are prefixed with '??'
      // Modified files are prefixed with 'M'
      // https://git-scm.com/docs/git-status/1.8.1#_output
      // https://stackoverflow.com/a/6978402/6178885
      return (
        result.indexOf('??') === 0 ||
        result.indexOf('M') === 0
      );
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
