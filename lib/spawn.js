var _ = require('lodash');
var createObservable = require('@rxjs/rx/observable/create.js');
var spawn = require('child_process').spawn;

module.exports = function(RxNode) {

  RxNode.spawn = function(command, args, options) {
    /* TODO should we use something like this?
    var quote = require('shell-quote').quote;
    command = quote([command]);
    args = args || [];
    args = args.map(function(arg) {
      return quote([arg]);
    });
    //*/
    var childProcess = spawn(command, args, options);

    return createObservable(function(observer) {
      function dataHandler(data) {
        observer.onNext(data);
      }

      function errorHandler(err) {
        err.message = (err.message || '') + 'spawn error for ' + command;
        observer.onError(err);
      }

      function endHandler(code) {
        // TODO: some grep documentation says POSIX error handling code should check for code with
        // value of 2 or greater, but doesn't error code 1 sometimes mean "Operation not permitted"?
        // Should error code 1 ever throw an error here?
        if (!_.isNumber(code) || code >= 2) {
          var err = new Error('spawn error: ' + command + ' process exited with code ' + code);
          throw err;
        }
        observer.onCompleted();
      }

      childProcess.stdout.addListener('data', dataHandler);
      childProcess.stderr.addListener('data', errorHandler);
      childProcess.addListener('close', endHandler);

      return function() {
        childProcess.stdout.removeListener('data', dataHandler);
        childProcess.stderr.removeListener('data', errorHandler);
        childProcess.removeListener('close', endHandler);
      };
    }).publish().refCount();
  };
};
