/*jshint esversion: 6 */

import chai from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

var should = chai.should();
var SerialPort,SerialPortStub;

describe('Init', function () {
  before(function(done){
    SerialPort = require('SerialPort');
    SerialPortStub = sinon.stub(SerialPort, 'SerialPort');

  });

  it('shoud do something', function(done){
    var SerialPortStub = function(port, callback){
      callback(null);
    };

    var mdc = proxyquire('SerialPort', {
      'SerialPort' : SerialPortStub
    });

    var m = new mdc.default();
    m.connect({
      comName: 'dummy',
      baudRate: 1,
      dataBits: 7,
      stopBits: 1,
      parity: 'none'})
    .then(function(result){

    });

  });
});
