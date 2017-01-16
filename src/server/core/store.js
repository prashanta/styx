/*jshint esversion: 6 */
import Datastore from 'nedb';
import _ from 'underscore';
import Promise from 'bluebird';
import tracer from 'tracer';
import config from '../config';

var logger = tracer.console({level:config.logLevel});

export default class Store{
    constructor(){
        this.dataFile = config.root+'/.store';
        this.db = '';
        this.init = false;

        this.machineId = '';
        this.token = '';
        this.channelId = '';

        this.port = {
            comName: '/dev/cu.usbserial',
            baudRate: 115200,
            dataBits: 8,
            stopBits: 1,
            parity: 'none'
        };

    }

    setup(){
        this.count ++;
        return new Promise(function(resolve,reject){
            // Skip if store already initalized
            if(!this.init){
                // Create new data store
                this.db = new Datastore({ filename: this.dataFile, autoload: true });
                // Find id=0 data row
                this.db.findOne({id:0},function(err, doc){
                    if(err)
                        reject(err);
                    // If not preset set blank data
                    if(doc === null){
                        var temp = [{
                            id: 0,
                            machineId: '',
                            token: '',
                            channelId: '',
                        }];
                        this.db.insert(temp);
                    }
                    // If present get the values
                    else{
                        this.machineId = doc.machineId;
                        this.token = doc.token;
                        this.channelId = doc.channelId;
                    }
                    this.init = true;
                    resolve();
                }.bind(this));
            }
            else{
                resolve();
            }
        }.bind(this));
    }

    setCredentials(machineId, token, channelId){
        return new Promise(function(resolve,reject){
            var temp = {
                machineId: machineId,
                token: token,
                channelId: channelId
            };
            this.db.update({id:0}, {$set: temp}, function(err, numReplaced){
                if(err)
                    reject(err);
                else {
                    this.machineId = machineId;
                    this.token = token;
                    this.channelId= channelId;
                    resolve();
                }
            }.bind(this));
        }.bind(this));
    }

    setPortName(name){
        this.port.comName = name;
    }
}
