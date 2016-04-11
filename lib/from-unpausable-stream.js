'use strict';

//var AbstractObserver = require('@rxjs/rx/observer/abstractobserver.js');
//var Disposable = require('@rxjs/rx/disposable.js');
var ObservableBase = require('@rxjs/rx/observable/observablebase.js');
//var createObservable = require('@rxjs/rx/observable/create.js');
var inherits = require('inherits');
var isFunction = require('@rxjs/rx/helpers/isfunction');
//var Subject = require('@rxjs/rx/subject.js');
var publish = require('@rxjs/rx/observable/publish.js');
//var SingleAssignmentDisposable = require('@rxjs/rx/singleassignmentdisposable.js');

function FromUnpausableStreamDisposable(del) {
  this._del = del;
  this.isDisposed = false;
}

FromUnpausableStreamDisposable.prototype.dispose = function() {
  if (!this.isDisposed) {
    this._del();
    this.isDisposed = true;
  }
};

function FromUnpausableStreamObservable(stream, finishEventName, dataEventName) {
  this._stream = stream;
  this._finishEventName = finishEventName;
  this._dataEventName = dataEventName;
  ObservableBase.call(this);
}

inherits(FromUnpausableStreamObservable, ObservableBase);

FromUnpausableStreamObservable.prototype.subscribeCore = function(o) {
  var stream = this._stream;
  var finishEventName = this._finishEventName;
  var dataEventName = this._dataEventName;

  if (stream.pause) {
    stream.pause();
  }

  var _del = function() {
    stream.removeListener(dataEventName, o.onNext);
    stream.removeListener('error', o.onError);
    stream.removeListener(finishEventName, o.onCompleted);
  };

  dataEventName = dataEventName || 'data';
  finishEventName = finishEventName || 'end';

  stream.addListener(dataEventName, function(x) {
    o.onNext(x);
  });
  stream.addListener('error', function(err) {
    o.onError(err);
  });
  stream.addListener(finishEventName, function() {
    o.onCompleted();
  });

  if (stream.resume) {
    stream.resume();
  }

  console.log('o');
  console.log(o);

  return new FromUnpausableStreamDisposable(_del);
};

module.exports = function(stream, finishEventName, dataEventName) {
  return publish(new FromUnpausableStreamObservable(stream, finishEventName, dataEventName))
  .refCount();
};
