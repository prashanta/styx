/*jshint esversion: 6 */

// Function related to Machine Data Collection

import SerialPort from 'serialport';
import Promise from 'bluebird';
import tracer from 'tracer';
import config from '../config';
var logger = tracer.console({level:config.logLevel});

export default class Mdc{
    constructor(){
        this.port = null;
        this._result = "";
    }
    getSerialPorts(){
        return new Promise(function(resolve, reject){
            var portList = [];
            SerialPort.list(function (err, ports) {
                if(ports.length > 0){
                    ports.forEach(function(port) {
                        portList.push(port.comName);
                    });
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
                        reject(error);
                    }
                    else{
                        this.port.on('data', function (data) {
                            var temp = data;
                            //logger.log(temp.split('').map(function(c){ return c.charCodeAt (0); }));
                            //logger.log(temp);
                            temp = temp.substring(1, temp.length - 1);
                            if(temp != '>')
                                this._result += temp;


                        }.bind(this));
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
        var _result = {};
        return new Promise(function(resolve,reject){
            this.getQ100()
            .bind(this)
            .then(function(result){
                _result.q100 = result;
                return this.getQ104();
            })
            .then(function(result){
                _result.q104 = result;
                return this.getQ500();
            })
            .then(function(result){
                _result.q500 = result;
                resolve(_result);
            })
            .catch(function(error){
                reject(error);
            });
        }.bind(this));
    }

    sendCommand(command){
        return new Promise(function(resolve,reject){
            this._result = "";
            this.port.write(command+"\r\n", function(error){
                if(error)
                    logger.error(error.message);
            }.bind(this));
            Promise.delay(1000).then(function(){
                resolve(this._result);
            }.bind(this));
        }.bind(this));
    }

    getQ100(){
        return this.sendCommand('Q100');
    }

    getQ104(){
        return this.sendCommand('Q104');
    }

    getQ500(){
        return this.sendCommand('Q500');
    }

}
