/*jshint esversion: 6 */
import tracer from 'tracer';
import dns from 'dns';
import Promise from 'bluebird';
import restClient from './restclient';
import Store from './store';
import Mdc from './mdc';
import Msg from './msg';
import config from '../config';
var logger = tracer.console({level:config.logLevel});

class Device{
    constructor(){
        this.NETWORK_OK = false;
        this.ACTIVATE_OK = false;

        this.store = new Store();
        this.msg = new Msg();
        this.mdc = new Mdc();
        this.count = 100;
    }
    // Run device
    run(){
        logger.log("Runing device... ");
        // Initialize store
        this.store.setup()
        .bind(this)
        // INITIALIZE CHANNEL AND GET PORTS
        .then(function(result){
            if(this.store.channelId)
                this.msg.initChannel(this.store.channelId);
            return this.getPorts();
        })
        // CHECK NETWORK CONNECTION
        .then(function(result){
            this.mdc.connect(this.store.port); // THIS HAS TO BE DONE SOMEWHERE ELSE
            return this.checkNetworkConnection();
        })
        // CHECK MACHINE CREDENTIAL
        .then(function(result){
            return this.validateToken(this.store.machineId, this.store.token);
        })
        // FINALLY - SEND MACHINE DATA
        .then(function(){
            this.sendMachineData();
        })
        .catch(function(error){
            logger.error(error.message);
            // CALL A FUNCTION TO CHECK EVERYTHING AGAIN ...
            //setTimeout(this.run.bind(this), 5000);
        })
        .finally(function(){
            logger.log('NETWORK_OK : ' + this.NETWORK_OK);
            logger.log('ACTIVATE_OK : ' + this.ACTIVATE_OK);

        });
    }

    getPorts(){
        return new Promise(function(resolve,reject){
            this.mdc.getSerialPorts()
            .then(function(result){
                logger.log(result);
                resolve(1);
            });
        }.bind(this));
    }

    // Check if network connection is working
    checkNetworkConnection(){
        this.NETWORK_OK = false;
        return new Promise(function(resolve,reject){
            dns.resolve(config.NET_CHK_HOSTNAME, function(err, address){
                if(err)
                    reject(err);
                else{
                    resolve(1);
                    this.NETWORK_OK = true;
                }
            }.bind(this));
        }.bind(this));
    }

    // Check server connection
    validateToken(machineId, token){
        this.ACTIVATE_OK = false;
        return new Promise(function(resolve,reject){
            logger.log("Checking server... ");
            restClient.validateToken(machineId, token)
            .bind(this)
            .then(function(response){
                logger.log(response);
                this.ACTIVATE_OK = true;
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
        if(this.NETWORK_OK && this.ACTIVATE_OK){
            logger.log("Read machine data and send to server");
            this.mdc.getData()
            .bind(this)
            .then(function(result){
                logger.log(result);
                setTimeout(this.sendMachineData.bind(this), 10000);
            });
            // this.msg.publish({
            //     count: 'fa',
            //     machineId: this.store.machineId
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
        this.ACTIVATE_OK = false;
        return new Promise(function(resolve,reject){
            logger.log("Registering device with server using activation code " + activationCode);

            restClient.activateMachine(activationCode)
            .bind(this)
            .then(function(result){
                return this.store.setCredentials(result.machineId, result.token, result.channelId);
            })
            .then(function(result){
                this.ACTIVATE_OK = true;
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
