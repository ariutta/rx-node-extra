var _ = require('lodash');
var inquirer = require('inquirer');
var Rx = require('rx-extra');
var RxNode = require('rx-node');
var spawn = require('child_process').spawn;

function ask(source, getPrompts, createIterable) {
  createIterable = createIterable || function(x) {
    return _.isArray(x) ? x : [x];
  };

  var itemSource = source
    .concatMap(function(sourceValue) {
      var items = createIterable(sourceValue);
      return Rx.Observable.from(items);
    });

  var fullPromptSource = itemSource
    .concatMap(function(item) {
      var prompts = getPrompts(item);
      return Rx.Observable.from(prompts);
    });

  var inquirerSource = inquirer.prompt(fullPromptSource).process;

  return itemSource
    .concatMap(function(item) {
      var starter = {
        value: item,
        answers: {}
      };

      var prompts = getPrompts(item);
      var finalPromptIndex = prompts.length - 1;
      var promptIndex = 0;
      return Rx.Observable.while(
          function() {
            return promptIndex++ <= finalPromptIndex;
          },
          inquirerSource.take(1)
        )
        .reduce(function(accumulator, response) {
          var name = response.name;
          var answer = response.answer;
          var answers = accumulator.answers;
          answers[name] = answer;

          // If the next prompt is skipped due to inquirer's
          // "when" option, we need to take one fewer.
          //
          // NOTE: "promptIndex" here corresponds to the
          // promptIndex for the next time we are to enter
          // the "while" block above.
          var nextPrompt = prompts[promptIndex];
          if (nextPrompt) {
            var nextWhen = nextPrompt.when;
            if (nextWhen && !nextWhen(answers)) {
              // decrement so as to take one fewer.
              finalPromptIndex -= 1;
            }
          }

          accumulator.answers = answers;
          return accumulator;
        }, starter);
    });
}

Rx.Observable.prototype.ask = function(getPrompts, createIterable) {
  var source = this;

  return source
    .let(function(o) {
      return ask(o, getPrompts, createIterable);
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
  /* TODO should we use something like this?
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
