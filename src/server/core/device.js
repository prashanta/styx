/*jshint esversion: 6 */
import Promise from 'bluebird';
import config from '../config';
import Setting from './setting';
import Mdc from './mdc';
import Msg from './msg';
import * as network from './network';

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
    logger.log("Runing device... ");
    // Initialize store
    this.setting.init()
    .bind(this)
    // CHECK NETWORK CONNECTION
    .then(function(result){
      this.OK_NETWORK = false;
      return network.checkNetworkConnection();
    })
    // VALIDATE SERVER TOKEN
    .then(function(result){
      this.OK_NETWORK = true;
      this.OK_TOKEN = false;
      return this.validateToken(this.setting.credential.machineId, this.setting.credential.token);
    })
    // INITIALIZE CHANNEL AND GET PORTS
    .then(function(result){
      this.msg.initChannel(this.setting.channelId);

    })
    // CONNECT SERIAL PORT
    // .then(function(result){
    //   OK_SERIAL_PORT = false;
    //   return this.mdc.connect(this.setting.port); // THIS HAS TO BE DONE SOMEWHERE ELSE
    // })
    // FINALLY - SEND MACHINE DATA
    .then(function(){
      this.OK_TOKEN = true;
  //   OK_SERIAL_PORT = true;
      this.sendMachineData();
    })
    .catch(function(error){
      logger.error(error.message);
      // CALL A FUNCTION TO CHECK EVERYTHING AGAIN ...
      //setTimeout(this.run.bind(this), 5000);
    })
    .finally(function(){
      logger.log('OK_NETWORK : ' + this.OK_NETWORK);
      logger.log('OK_TOKEN : ' + this.OK_TOKEN);

    });
  }

  // VALIDATE TOKEN WITH SERVER
  validateToken(machineId, token){
    this.OK_TOKEN = false;
    return new Promise(function(resolve,reject){
      logger.log("Checking server... ");
      restClient.validateToken(machineId, token)
      .bind(this)
      .then(function(response){
        logger.log(response);
        this.OK_TOKEN = true;
        resolve(true);
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

  // Send machine data to server
  sendMachineData(){
    if(this.OK_NETWORK && this.OK_TOKEN){
      logger.log("Read machine data and send to server");
      setTimeout(this.sendMachineData.bind(this), 10000);

      // this.mdc.getData()
      // .bind(this)
      // .then(function(result){
      //   logger.log(result);
      //   setTimeout(this.sendMachineData.bind(this), 10000);
      // });
      // this.msg.publish({
      //     count: 'fa',
      //     machineId: this.setting.machineId
      // })
      // .bind(this)
      // .then(function(result){
      //     this.count ++;
      // })
      // .catch(function(error){
      //     logger.error(error.message);
      // })
      // .finally(function(){
      //     setTimeout(this.sendMachineData.bind(this), 10000);
      // });
    }
  }

  // Register device with server
  activateMachine(activationCode){
    this.OK_TOKEN = false;
    return new Promise(function(resolve,reject){
      logger.log("Registering device with server using activation code " + activationCode);

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
          }
          else if(error.statusCode === 401){
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
