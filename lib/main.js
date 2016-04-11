//var Rx = require('rx-extra');
var RxNode = require('rx-node');

var RxNodeExtra = function() {};

//RxNodeExtra.prototype = {};

//var fromUnpausableStream = require('./from-unpausable-stream.js');
//
//Rx.Observable.addToObject({
//  ask: require('./ask.js'),
//  fromUnpausableStream: require('./from-unpausable-stream.js'),
//  //partitionNested: require('../../lib/partition-nested.js'),
//});
//Rx.Observable.addToPrototype({
//  ask: require('./ask.js'),
//  fromUnpausableStream: fromUnpausableStream,
//  //partitionNested: require('../../lib/partition-nested.js'),
//  //then: require('../../lib/then.js'),
//  //toNodeCallback: require('../../lib/to-node-callback.js'),
//});
//
//RxNode.Rx = Rx;
//
//RxNode.prototype = RxNode.prototype || {};
//
//RxNode.fromUnpausableStream = fromUnpausableStream;
//RxNode.prototype.fromUnpausableStream = fromUnpausableStream;
//
//require('./ask.js')(Rx, RxNode);
//require('./spawn.js')(Rx, RxNode);

//RxNodeExtra.addToObject = function(operators) {
//  console.log('RxNodeExtra.addToObject');
//  Object.keys(operators).forEach(function(operator) {
//    console.log(operator);
//    RxNodeExtra[operator] = operators[operator];
//  });
//};
//
//RxNodeExtra.addToPrototype = function(operators) {
//  console.log('RxNodeExtra.addToPrototype');
//  Object.keys(operators).forEach(function(operator) {
//    console.log(operator);
//    RxNodeExtra.prototype[operator] = function() {
//      var args = [this];
//      args.push.apply(args, arguments);
//      return operators[operator].apply(null, args);
//    };
//  });
//};

RxNodeExtra.addToObject = function(operators) {
  operators = operators || {};
  console.log('RxNodeExtra.addToObject');
  //Object.keys(RxNodeExtra)
  Object.keys(RxNode)
  .map(function(key) {
    return [key, RxNode[key]];
  })
  .concat(
      Object.keys(operators)
      .map(function(key) {
        return [key, operators[key]];
      })
  )
  .forEach(function(pair) {
    var operator = pair[0];
    console.log(operator);
    RxNodeExtra[operator] = pair[1];
  });
};

RxNodeExtra.addToPrototype = function(operators) {
  operators = operators || {};
  console.log('RxNodeExtra.addToPrototype');
  //Object.keys(RxNodeExtra)
  var pairs = Object.keys(RxNode)
  .map(function(key) {
    return [key, RxNode[key]];
  })
  .concat(
      Object.keys(operators)
      .map(function(key) {
        return [key, operators[key]];
      })
  );

  pairs
  .forEach(function(pair) {
    var operator = pair[0];
    console.log(operator);
//    RxNodeExtra[operator] = function() {
//      var args = [this];
//      args.push.apply(args, arguments);
//      return pair[1].apply(null, args);
//    };
//    pairs
//    .forEach(function(subpair) {
//      var suboperator = subpair[0];
//      RxNodeExtra[operator][suboperator] = function() {
//        var args = [this];
//        args.push.apply(args, arguments);
//        return pair[1].apply(null, args);
//      };
//    });

    RxNodeExtra.prototype[operator] = function() {
      var args = [this];
      args.push.apply(args, arguments);
      return pair[1].apply(null, args);
    };
  });
};

RxNodeExtra.addToObject();
RxNodeExtra.addToPrototype();

module.exports = RxNodeExtra;
