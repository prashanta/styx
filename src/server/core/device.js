/*jshint esversion: 6 */

import request from 'request-promise';
import tracer from 'tracer';
import Store from './store';
import config from '../config';
var logger = tracer.console({level:config.logLevel});

class Device{
    constructor(){
        // A device is ready when it has umid and token; and ready for action - send Machine Data & receive NC files
        this.ready = false;
        this.store = new Store();
    }

    // Run device
    run(){
        // Initialize store
        this.store.init()
        .then(function(result){
            // If credentials are present ...
            if(result.umid && result.token){
                // ... check if server can be connected
                return this.checkServer();
            }
            // If cedentials not present ...
            else{
                // ... return reject and do nothing
                return Promise.reject("No credentials ... so wait for user to activate.");
            }
        }.bind(this))
        .then(function(result){
            // If server can be connected
            if(result){
                this.ready = true;
                // ... start sending Machine Date
                this.sendMachineData();
            }
            // If server cannot be connected
            else {
                logger.error("Server cannot be connected");
                this.ready = false;
                return Promise.reject();
            }
        }.bind(this))
        .catch(function(error){
            logger.error(error);
        });
    }

    checkServer(){
        return new Promise(function(resolve,reject){
            logger.log("Checking server... ");
            resolve(true);
        });
    }

    sendMachineData(){
        logger.log("flag1");
        if(this.ready){
            logger.log("Read machine data and send to server");
            setTimeout(this.sendMachineData.bind(this), 10000);
        }
    }

    registerDevice(activationCode){
        return new Promise(function(resolve,reject){
            logger.log("Register device with server using activation code " + activationCode);
            // Register with server and get umid and token
            var temp = {token: '90210', umid: '90212'};
            this.store.setCredentials(temp.token, temp.umid)
            .then(function(result){
                logger.log(result);
                this.ready = true;
                this.sendMachineData();
                resolve(result);
            }.bind(this));
        }.bind(this));
    }


}

var device = new Device();
export default device;
