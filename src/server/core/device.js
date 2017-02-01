/*jshint esversion: 6 */
import Promise from 'bluebird';
import isOnline from 'is-online';
import config from './../config';
import Setting from './setting';
import Err from './../error';
import Mdc from './mdc';
import Msg from './msg';
import * as restClient from './restclient';

var logger = config.logger;

class Device{

  constructor(){
    this.OK_NETWORK = false;
    this.OK_TOKEN = false;
    this.OK_SERIAL_PORT = false;

    this.setting = new Setting();
    this.msg = new Msg();
    this.mdc = new Mdc();
  }

  // RUN DEVICE
  run(force){
    // INIT SETTING
    this.setting.init()
    .bind(this)
    // CHECK NETWORK CONNECTION
    .then(this.checkNetworkConnection)
    // CHECK TOKEN
    .then(this.checkToken)
    // CONNECT SERIAL PORT
    .then(this.connectSerialPort)
    // SEND MACHINE DATA
    .then(function(){
      this.msg.init(this.setting.credential.machineId, this.setting.credential.channelId);
      this.sendMachineData();
    })
    .catch(Err.ServerNotFound, function(error){
      logger.error(error.message);
    })
    .catch(function(error){
      logger.error(error.message);
    })
    .finally(function(){
      if(!(this.OK_NETWORK && this.OK_TOKEN && this.OK_SERIAL_PORT))
        setTimeout(this.run.bind(this), 10000);
      logger.log('OK_NETWORK : ' + this.OK_NETWORK);
      logger.log('OK_TOKEN : ' + this.OK_TOKEN);
      logger.log('OK_SERIAL_PORT : ' + this.OK_SERIAL_PORT);
    });
  }

  checkNetworkConnection(){
    return new Promise(function(resolve,reject){
      logger.info('Checking network connection');
      this.OK_NETWORK = false;
      isOnline()
      .then(function(online){
        if(online){
          this.OK_NETWORK = true;
          resolve();
        }
        else
          reject(new Error("No network connection"));
      }.bind(this))
      .catch(function(error){
        reject(error);
      });
    }.bind(this));
  }
  // VALIDATE TOKEN WITH SERVER
  checkToken(){
    return new Promise(function(resolve,reject){
      logger.info('Checking token with server');
      this.OK_TOKEN = false;
      restClient.validateToken(this.setting.credential).bind(this)
      .then(function(response){
        this.OK_TOKEN = true;
        resolve();
      })
      .catch(function(error){
        if(error.statusCode){
          if(error.statusCode === 401){
            logger.error("Token not verified. Need to activate device again.");
          }
        }
        reject(error);
      });
    }.bind(this));
  }

  connectSerialPort(){
    return new Promise(function(resolve,reject){
      logger.info('Connecting serial port');
      this.OK_SERIAL_PORT = false;
      this.mdc.connect(this.setting.port).bind(this)
      .then(function(){
        this.OK_SERIAL_PORT = true;
        resolve();
      })
      .catch(function(error){
        reject(error);
      });
    }.bind(this));
  }

  // Send machine data to server
  sendMachineData(){
    if(this.OK_NETWORK && this.OK_TOKEN && this.OK_SERIAL_PORT){
      logger.log("Read machine data and send to server");
      this.mdc.getData().bind(this)
      .then(function(result){
        var tasks = [];
        if(result.length > 0){
          result.forEach(function(data, index){
            let payload = Object.assign({machineId: this.setting.credential.machineId}, data);
            tasks.push(this.msg.publish(payload));
          }.bind(this));
          return Promise.all(tasks);
        }
        else
          Promise.resolve();
      })
      .catch(function(error){
        logger.error(error.message);
      })
      .finally(function(){
        setTimeout(this.sendMachineData.bind(this), config.MDC_INTERVAL);
      });
    }
  }

  // Register device with server
  activateMachine(activationCode){
    this.OK_TOKEN = false;
    return new Promise(function(resolve,reject){
      logger.log("Activating device using code: " + activationCode);
      restClient.activateMachine(activationCode)
      .bind(this)
      .then(function(result){
        return this.setting.setCredentials(result.machineId, result.token, result.channelId);
      })
      .then(function(result){
        this.OK_TOKEN = true;
        this.run();
        resolve(result);
      })
      .catch(function(error){
        if(error.statusCode){
          if(error.statusCode === 400){
            logger.error(error.message);
          }else if(error.statusCode === 401){
            logger.error("Token not verified. Need to activate device again.");
          }
        }
        reject(error);
      });
    }.bind(this));
  }
}

var device = new Device();
export default device;
