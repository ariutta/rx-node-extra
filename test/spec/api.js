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
  getPromptSet: function(item) {
    return [{
      type: 'confirm',
      name: 'prompt1',
      message: 'Confirm something',
    default: true
    }];
  },
  bddStdinBound: bddStdin.bind(null,
                                 '\n',
                                 'n', '\n',
                                 '\n',
                                 'n', '\n'),
  expected: [[{
    value: {
      filepath: 'a',
      value: 1
    },
    answers: {
      prompt1: true
    }
  }, {
    value: {
      filepath: 'a',
      value: 2
    },
    answers: {
      prompt1: false
    }
  }], [{
    value: {
      filepath: 'b',
      value: 1
    },
    answers: {
      prompt1: true
    }
  }, {
    value: {
      filepath: 'b',
      value: 2
    },
    answers: {
      prompt1: false
    }
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
  getPromptSet: function(item) {
    return [{
      type: 'confirm',
      name: 'prompt1',
      message: 'Confirm something one',
      default: true
    }, {
      type: 'confirm',
      name: 'prompt2',
      message: 'Confirm something two',
      default: true
    }];
  },
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
    value: {
      filepath: 'a',
      value: 1
    },
    answers: {
      prompt1: true,
      prompt2: false
    }
  }, {
    value: {
      filepath: 'a',
      value: 2
    },
    answers: {
      prompt1: false,
      prompt2: true
    }
  }], [{
    value: {
      filepath: 'b',
      value: 1
    },
    answers: {
      prompt1: true,
      prompt2: false
    }
  }, {
    value: {
      filepath: 'b',
      value: 2
    },
    answers: {
      prompt1: false,
      prompt2: true
    }
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
  getPromptSet: function(item) {
    return [{
      type: 'input',
      name: 'setValue',
      message: 'Specify a value for "' + item.filepath + '"',
      default: item.value
    }, {
      type: 'confirm',
      name: 'save',
      message: 'Save?',
      default: true,
      when: function(answers) {
        return answers.setValue !== '';
      }
    }];
  },
  bddStdinBound: bddStdin.bind(null,
                                 '\n',
                                 '\n',
                                 '\n',
                                 'n', '\n',
                                 '\n',
                                 'n', '\n',
                                 '\n',
                                 '\n'),
  expected: [[{
    value: {
      filepath: 'a',
      value: 1
    },
    answers: {
      setValue: 1,
      save: true
    }
  }, {
    value: {
      filepath: 'a',
      value: 2,
    },
    answers: {
      setValue: 2,
      save: false
    }
  }], [{
    value: {
      filepath: 'b',
      value: 1
    },
    answers: {
      setValue: 1,
      save: false
    }
  }, {
    value: {
      filepath: 'b',
      value: 2
    },
    answers: {
      setValue: 2,
      save: true
    }
  }]]
}, {
  input: [[{
    filepath: 'a',
    value: 1
  }, {
    filepath: 'a',
    value: 2
  }], [{
    filepath: 'b',
    value: 1
  }, {
    filepath: 'b',
    value: 2
  }]],
  createIterable: function(data) {
    return data.reduce(function(accumulator, item) {
      return accumulator.concat(item);
    }, []);
  },
  getPromptSet: function(item) {
    return [{
      type: 'input',
      name: 'setValue',
      message: 'Specify a value for "' + item.filepath + '"',
      default: item.value
    }, {
      type: 'confirm',
      name: 'save',
      message: 'Save?',
      default: true,
      when: function(answers) {
        return answers.setValue !== '';
      }
    }];
  },
  bddStdinBound: bddStdin.bind(null,
                                 '\n',
                                 '\n',
                                 '\n',
                                 'n', '\n',
                                 '\n',
                                 'n', '\n',
                                 '\n',
                                 '\n'),
  expected: [[{
    value: {
      filepath: 'a',
      value: 1
    },
    answers: {
      setValue: 1,
      save: true
    }
  }, {
    value: {
      filepath: 'a',
      value: 2,
    },
    answers: {
      setValue: 2,
      save: false
    }
  }], [{
    value: {
      filepath: 'b',
      value: 1
    },
    answers: {
      setValue: 1,
      save: false
    }
  }, {
    value: {
      filepath: 'b',
      value: 2
    },
    answers: {
      setValue: 2,
      save: true
    }
  }]]
}, {
  input: [[{
    filepath: 'a',
    value: 1
  }, {
    filepath: 'a',
    value: 2
  }], [{
    filepath: 'b',
    value: 1
  }, {
    filepath: 'b',
    value: 2
  }]],
  createIterable: function(data) {
    return data.reduce(function(accumulator, item) {
      return accumulator.concat(item);
    }, []);
  },
  getPromptSet: function(item) {
    return [{
      type: 'input',
      name: 'setValue',
      message: 'Specify a value for "' + item.filepath + '"',
      default: item.value
    }, {
      type: 'confirm',
      name: 'save',
      message: 'Save?',
      default: true,
      when: function(answers) {
        return answers.setValue !== 'abc';
      }
    }];
  },
  bddStdinBound: bddStdin.bind(null,
                                 'abc', '\n', // setValue to 'abc'
                                 '\n', // setValue to 2
                                 'n', '\n', // don't save
                                 '\n', // setValue to 1
                                 'n', '\n', // don't save
                                 '\n', // setValue to 2
                                 '\n'), // save
  expected: [[{
    value: {
      filepath: 'a',
      value: 1
    },
    answers: {
      setValue: 'abc'
    }
  }, {
    value: {
      filepath: 'a',
      value: 2,
    },
    answers: {
      setValue: 2,
      save: false
    }
  }], [{
    value: {
      filepath: 'b',
      value: 1
    },
    answers: {
      setValue: 1,
      save: false
    }
  }, {
    value: {
      filepath: 'b',
      value: 2
    },
    answers: {
      setValue: 2,
      save: true
    }
  }]]
}];

function runAsk(askOption) {
  it('should ask for each item', function(done) {
    askOption.bddStdinBound();
    Rx.Observable.from(askOption.input)
      .ask(askOption.getPromptSet, askOption.createIterable)
      .splitOnChange(function(x) {
        return x.value.filepath;
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
    runAsk(askOption);
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
