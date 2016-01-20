require('pretty-error').start();
var _ = require('lodash');
var inquirer = require('inquirer');
var VError = require('verror');

module.exports = function(RxNode) {
  var Rx = RxNode.Rx;
  /**
   * ask
   *
   * @param source
   * @param {function} getPromptSet must return an array of one or more inquirer prompts
   * @param {function} createIterable must return an array where each item is to be
   *                   presented with every prompt in the promptSet
   * @return {Observable} with each item being
   *                     {value: itemFromIterable, answers: answersFromPromptSet}
   */
  function ask(source, getPromptSet, createIterable) {
    createIterable = createIterable || function(x) {
      return _.isArray(x) ? x : [x];
    };

    var itemSource = source
      .concatMap(function(sourceValue) {
        var items = createIterable(sourceValue);
        return Rx.Observable.fromArray(items);
      });

    var fullPromptSource = itemSource
      .concatMap(function(item) {
        var promptSet = getPromptSet(item);
        return Rx.Observable.fromArray(promptSet);
      });

    var inquirerSource = inquirer.prompt(fullPromptSource).process;

    return itemSource
      .concatMap(function(item) {
        var starter = {
          value: item,
          answers: {}
        };

        var promptSet = getPromptSet(item);
        var finalPromptIndex = promptSet.length - 1;
        var promptIndex = 0;
        return Rx.Observable.while(
            function() {
              // NOTE: the line below does the comparison before incrementing promptIndex.
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
            var nextPrompt = promptSet[promptIndex];
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
      })
      .doOnError(function(err) {
        var newError = new VError(err, 'Error with ask');
        console.error(newError.stack);
      });
  }

  Rx.Observable.prototype.ask = function(getPromptSet, createIterable) {
    var source = this;

    return source
      .let(function(o) {
        return ask(o, getPromptSet, createIterable);
      });
  };

  RxNode.ask = function(getPromptSet) {
    var promptSet = getPromptSet();
    var promptSource = Rx.Observable.fromArray(promptSet);

    return inquirer.prompt(promptSource).process
      .reduce(function(accumulator, response) {
        var name = response.name;
        var answer = response.answer;
        accumulator[name] = answer;
        return accumulator;
      }, {})
      .doOnError(function(err) {
        var newError = new VError(err, 'Error with ask');
        console.error(newError.stack);
      });
  };
};
