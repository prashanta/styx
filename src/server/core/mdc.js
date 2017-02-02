/*jshint esversion: 6 */
import moment from 'moment';
import SerialPort from 'serialport';
import Promise from 'bluebird';
import tracer from 'tracer';
import config from '../config';
import Errors from '../error';

var logger = config.logger;

export default class Mdc {
    constructor() {
        this.port = null;
        this._result = "";
        this.prevQ104 = "";
        this.prevQ500 = "";
        this.prevSpindle = -1;

        this.data = {
            availability : false,
            mode: null,
            zeroRet: null,
            execution: null,
            system: null
        };

        this.countA = 1;
        this.countB = 1;
        this.countC = 1;

    }

    getSerialPorts() {
        return new Promise(function(resolve, reject) {
            var portList = [];
            SerialPort.list(function(err, ports) {
                if (ports.length > 0) {
                    ports.forEach(function(port) {
                        portList.push(port.comName);
                    });
                    resolve(portList);
                } else {
                    reject(new Error("No ports found"));
                }
            });
        });
    }

    connect(port) {
        return new Promise(function(resolve, reject) {
            if (!this.port) {
                this.port = new SerialPort(port.comName, {
                    baudRate: port.baudRate,
                    dataBits: port.dataBits,
                    stopBits: port.stopBits,
                    parity: port.parity,
                    parser: SerialPort.parsers.readline('\r\n')
                    //parser: SerialPort.parsers.raw
                }, function(error) {
                    if (error) {
                        this.port = null;
                        reject(new Errors.SerialPortFault());
                    } else {
                        resolve();
                    }
                }.bind(this));
            } else {
                resolve();
            }
        }.bind(this));
    }

    getData() {
        var __result = [];
        let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

        return new Promise(function(resolve, reject) {
            this.getAvailability().bind(this)
            .then(this.getMode)
            .then(this.getState)
            .then(function(result){
                resolve();
            })
            .catch(function (error) {
                reject(error);
            })
            .finally(function(){
                logger.log('%j', this.data);
            });
        }.bind(this));
    }

    sendCommand(command) {
        return new Promise(function(resolve, reject) {
            this.port.on('data', function(data) {
                logger.log(data);
                var temp = data.substring(1, data.length - 1);
                if(temp != '>'){
                    this.port.removeAllListeners('data');
                    resolve(temp);
                }
            }.bind(this));

            this.port.write(command + "\r\n", function(error) {
                if (error) {
                    this.port.removeAllListeners('data');
                    logger.error(error.message);
                    reject(error);
                }
            }.bind(this));
        }.bind(this)).timeout(config.MDC_READ_TIMEOUT);
    }

    getAvailability() {
        logger.log('#### GETTING AVAIL ####');
        return new Promise(function (resolve, reject){
            this.sendCommand('Q100')
            .bind(this)
            .then(function(result) {
                if(result !== null && result.indexOf('S/N') === 0){
                    this.data.availability = true;
                    resolve();
                }
                else{
                    this.data.availability = false;
                    reject(new Error('Machine not available'));
                }
            })
            .catch(Promise.TimeoutError, function(error){
                this.data.availability = false;
                logger.error(error.message);
                reject(error);
            })
            .catch(function(error) {
                reject(error);
            });
        }.bind(this));
    }

    getMode() {
        logger.log('#### GETTING MODE ####');
        return new Promise(function (resolve, reject){
            this.sendCommand('Q104')
            .bind(this)
            .then(function(result){
                var data = result.split(',').map(d=>d.trim());
                switch(data[1]){
                    case 'MDI':
                        this.data.mode = 'MANUAL DATA INPUT';
                        break;
                    case 'JOG':
                        this.data.mode = 'MANUAL';
                        break;
                    case 'ZERO RET':
                        this.data.mode = 'MANUAL';
                        break;
                    default:
                        this.data.mode = 'AUTOMATIC';
                }
                if(data[1] == 'ZERO RET')
                    this.data.zeroRet = 'FAULT';
                else
                    this.data.zeroRet = 'NORMAL';
                resolve();
            })
            .catch(Promise.TimeoutError, function(error){
                this._availability = false;
                logger.error(error.message);
                resolve();
            })
            .catch(function(error) {
                reject(error);
            });
        }.bind(this));
    }

    getState() {
        logger.log('#### GETTING STATE ####');
        return new Promise(function (resolve, reject){
            this.sendCommand('Q500')
            .bind(this)
            .then(function(result){
                var data = result.split(',').map(d=>d.trim());

                if (data[0] == 'STATUS'){
                    if(data[1] == 'BUSY'){
                        this.data.execution = 'ACTIVE';
                        this.data.system = 'NORMAL';
                    }
                } else if (data[0] === 'PROGRAM'){
                    if (data[1] !== 'MDI')
                        this.data.program = data[1];

                    if (data[2] === 'IDLE')
                        this.data.execution = 'READY';

                    else if (data[2] === 'FEED HOLD')
                        this.data.execution = 'INTERRUPTED';

                    if (data[2] === 'ALARM ON'){
                        this.data.execution = 'STOPPED';
                        this.data.system = 'FAULT';
                    }
                    else{
                        this.data.system = 'NORMAL';
                    }
                }
                resolve();
            })
            .catch(Promise.TimeoutError, function(error){
                this._availability = false;
                logger.error(error.message);
                resolve();
            })
            .catch(function(error) {
                reject(error);
            });
        }.bind(this));
    }

    getSpindleSpeed() {
        return this.sendCommand('Q600 3027');
        //return Promise.resolve("" + this.countC++);
    }

}
