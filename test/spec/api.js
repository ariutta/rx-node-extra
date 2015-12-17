/**
 * Test public APIs
 */

var _ = require('lodash');
var bddStdin = require('bdd-stdin');
var expect = require('chai').expect;
var inquirer = require('inquirer');
var RxNode = require('../../index.js');
var Rx = RxNode.Rx;
var sinon = require('sinon');
var sologger = require('../sologger.js');

//process.env.NODE_ENV = 'development';

var askOptions = [{
  input: [{
    filepath: 'a',
    value: 1
  }, {
    filepath: 'a',
    value: 2
  }, {
    filepath: 'b',
    value: 1
  }, {
    filepath: 'b',
    value: 2
  }],
  prompts: [{
    type: 'confirm',
    name: 'prompt1',
    message: 'Confirm something',
    default: true
  }],
  bddStdinBound: bddStdin.bind(null,
                                 '\n',
                                 'n', '\n',
                                 '\n',
                                 'n', '\n'),
  expected: [[{
    filepath: 'a',
    value: 1,
    prompt1: true
  }, {
    filepath: 'a',
    value: 2,
    prompt1: false
  }], [{
    filepath: 'b',
    value: 1,
    prompt1: true
  }, {
    filepath: 'b',
    value: 2,
    prompt1: false
  }]]
}, {
  input: [{
    filepath: 'a',
    value: 1
  }, {
    filepath: 'a',
    value: 2
  }, {
    filepath: 'b',
    value: 1
  }, {
    filepath: 'b',
    value: 2
  }],
  prompts: [{
    type: 'confirm',
    name: 'prompt1',
    message: 'Confirm something one',
    default: true
  }, {
    type: 'confirm',
    name: 'prompt2',
    message: 'Confirm something two',
    default: true
  }],
  bddStdinBound: bddStdin.bind(null,
                                 '\n',
                                 'n', '\n',
                                 'n', '\n',
                                 '\n',
                                 '\n',
                                 'n', '\n',
                                 'n', '\n',
                                 '\n'),
  expected: [[{
    filepath: 'a',
    value: 1,
    prompt1: true,
    prompt2: false
  }, {
    filepath: 'a',
    value: 2,
    prompt1: false,
    prompt2: true
  }], [{
    filepath: 'b',
    value: 1,
    prompt1: true,
    prompt2: false
  }, {
    filepath: 'b',
    value: 2,
    prompt1: false,
    prompt2: true
  }]]
}];

function run(askOption) {
  var promptCount = askOption.prompts.length;
  it('should ask with ' + promptCount.toString() + ' prompt(s) for each item', function(done) {
    askOption.bddStdinBound();
    Rx.Observable.from(askOption.input)
      .ask(askOption.prompts)
      .splitOnChange(function(x) {
        return x.filepath;
      })
      .map(function(actual, i) {
        var expected = _.cloneDeep(askOption.expected[i]);
        return expect(actual).to.deep.equal(expected);
      })
      .subscribe(function(result) {
        // do something
      }, function(err) {
        throw err;
      }, done);
  });
}

// Run tests
describe('Public API', function() {
  _.each(askOptions, function(askOption) {
    run(askOption);
  }, this);

  it('should spawn child process that echoes "hello world!"', function(done) {
    // TODO should we make these tests work on Windows?
    RxNode.spawn('echo', ['hello world!'])
      .subscribe(function(result) {
        expect(result.toString()).to.equal('hello world!\n');
        done();
      });
  });
});
