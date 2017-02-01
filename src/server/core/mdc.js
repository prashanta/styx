/*jshint esversion: 6 */


import moment from 'moment';
import SerialPort from 'serialport';
import Promise from 'bluebird';
import tracer from 'tracer';
import config from '../config';
var logger = tracer.console({level:config.logLevel});

export default class Mdc{
  constructor(){
    this.port = null;
    this._result = "";
    this.prevQ104 = "";
    this.prevQ500 = "";
    this.prevSpindle = -1;

    this.countA = 1;
    this.countB = 1;
    this.countC = 1;

  }

  getSerialPorts(){
    return new Promise(function(resolve, reject){
      var portList = [];
      SerialPort.list(function (err, ports) {
        if(ports.length > 0){
          ports.forEach(function(port){ portList.push(port.comName); });
          resolve(portList);
        }
        else {
          reject(new Error("No ports found"));
        }
      });
    });
  }

  connect(port){
    return new Promise(function(resolve,reject){
      if(!this.port){
        this.port = new SerialPort(port.comName, {
          baudRate: port.baudRate,
          dataBits: port.dataBits,
          stopBits: port.stopBits,
          parity: port.parity,
          parser: SerialPort.parsers.readline('\r\n')
          //parser: SerialPort.parsers.raw
        }, function(error){
          if(error){
            logger.error(error.message);
            this.port = null;
            reject(error);
          }
          else{
            // this.port.on('data', function (data){
            //   var temp = data;
            //   temp = temp.substring(1, temp.length - 1);
            //   if(temp != '>')
            //   this._result += temp;
            // }.bind(this));
            resolve();
          }
        }.bind(this));
      }
      else {
        resolve();
      }
    }.bind(this));
  }

  getData(){
    var __result = [];
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    return new Promise(function(resolve,reject){
      this.getQ104().bind(this)
      .then(function(result){
        logger.log('Q104: ' + result);
        //if(result != this.prevQ104){
        __result.push({timestamp:timestamp, command: 'Q104', output: result});
        this.prevQ104 = result;
        //}
        return this.getQ500();
      })
      .then(function(result){
        logger.log('Q500: ' + result);
        //if(result != this.prevQ500){
        __result.push({timestamp:timestamp, command: 'Q500', output: result});
        this.prevQ500 = result;
        //}
        return this.getSpindleSpeed();
      })
      .then(function(result){
        logger.log('Spindle: ' + result);
        //if(result != this.prevSpindle){
        __result.push({timestamp:timestamp, command: 'Spindle', output: result});
        this.prevSpindle = result;
        //}
        resolve(__result);
      })
      .catch(function(error){
        reject(error);
      });
    }.bind(this));
  }

  sendCommand(command){
    return new Promise(function(resolve,reject){
      this.port.on('data', function (data){
        var temp = data.substring(1, data.length - 1);
        this.port.removeAllListners('data');
        resolve(temp != '>'? temp : null);
      }.bind(this));
      this.port.write(command+"\r\n", function(error){
        if(error){
          logger.error(error.message);
          reject(error);
        }
      }.bind(this));
    }.bind(this));
  }

  getAvailability(){
    this.sendCommand('Q100')
    .then(function(result){

    })
    .catch(function(error){

    });
  }

  getQ100(){
    return this.sendCommand('Q100');
  }

  getQ104(){
    //return this.sendCommand('Q104');
    return Promise.resolve(""+this.countA++);
  }

  getQ500(){
    //return this.sendCommand('Q500');
    return Promise.resolve(""+this.countB++);
  }

  getSpindleSpeed(){
    //return this.sendCommand('Q600 3027');
    return Promise.resolve(""+this.countC++);
  }

}
