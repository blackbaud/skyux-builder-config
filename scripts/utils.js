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

// Get name of feature branch.
// https://stackoverflow.com/a/12142066/6178885
function getFeatureBranch() {
  return exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
    .then((output) => output.replace(/\n/g, ''));
}

// Get git origin URL.
function getOriginUrl() {
  return exec('git', ['config', '--get', 'remote.origin.url'])
    .then((output) => output.replace(/\n/g, ''));
}

module.exports = {
  dirHasChanges,
  exec,
  getFeatureBranch,
  getOriginUrl
};
