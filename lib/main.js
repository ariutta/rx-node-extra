require('pretty-error').start();
var Rx = require('rx-extra');
var RxNode = require('rx-node');
var VError = require('verror');

RxNode.Rx = Rx;

require('./ask.js')(RxNode);
require('./from-unpausable-stream.js')(RxNode);
require('./spawn.js')(RxNode);

module.exports = RxNode;
