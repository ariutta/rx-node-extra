var _ = require('lodash');
var inquirer = require('inquirer');
var Rx = require('rx-extra');
var RxNode = require('rx-node');
var spawn = require('child_process').spawn;

function ask(source, prompts) {
  prompts = _.isArray(prompts) ? prompts : [prompts];
  var promptCount = prompts.length;
  var getPromptSource = function() {
    return Rx.Observable.from(prompts);
  };
  var fullPromptSource = source
    .concatMap(function(input) {
      input = _.isArray(input) ? input : [input];
      return Rx.Observable.from(input).concatMap(function(value) {
        return getPromptSource();
      });
    });

  var inquirerSource = inquirer.prompt(fullPromptSource).process;

  return source
    .concatMap(function(sourceValue) {
      return inquirerSource.take(promptCount)
        .reduce(function(accumulator, response) {
          var name = response.name;
          var answer = response.answer;
          accumulator[name] = answer;
          return accumulator;
        }, sourceValue);
    });
}

Rx.Observable.prototype.ask = function(prompts) {
  var source = this;

  return source
    .let(function(o) {
      return ask(o, prompts);
    });
};

RxNode.fromUnpauseableStream = function(stream, finishEventName) {
  if (stream.pause) {
    stream.pause();
  }

  finishEventName = finishEventName || 'end';

  return Rx.Observable.create(function(observer) {
    function dataHandler(data) {
      observer.onNext(data);
    }

    function errorHandler(err) {
      observer.onError(err);
    }

    function endHandler() {
      observer.onCompleted();
    }

    stream.addListener('data', dataHandler);
    stream.addListener('error', errorHandler);
    stream.addListener(finishEventName, endHandler);

    if (stream.resume) {
      stream.resume();
    }

    return function() {
      stream.removeListener('data', dataHandler);
      stream.removeListener('error', errorHandler);
      stream.removeListener(finishEventName, endHandler);
    };
  }).publish().refCount();
};

RxNode.spawn = function(command, args, options) {
  /*
  var quote = require('shell-quote').quote;
  command = quote([command]);
  args = args || [];
  args = args.map(function(arg) {
    return quote([arg]);
  });
  //*/
  var childProcess = spawn(command, args, options);

  return Rx.Observable.create(function(observer) {
    function dataHandler(data) {
      observer.onNext(data);
    }

    function errorHandler(err) {
      observer.onError(err);
    }

    function endHandler(code) {
      if (code !== 0) {
        console.error(command + ' process exited with code ' + code);
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

RxNode.Rx = Rx;

module.exports = RxNode;
