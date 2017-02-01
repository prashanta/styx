/*jshint esversion: 6 */
import Datastore from 'nedb';
import _ from 'underscore';
import Promise from 'bluebird';
import tracer from 'tracer';
import config from '../config';

var logger = config.logger;

export default class Setting{
  constructor(){
    this.dataFile = config.root+'/.store';
    this.db = null;
    this.initialized = false;

    this.DATA_CREDENTIAL = 0;
    this.DATA_PORT = 1;

    // SETTING VARIABLES

    this.credential = {
      machineId : '',
      token : '',
      channelId : ''
    };

    this.port = {
      comName: '/dev/cu.usbserial',
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    };
  }

  // INITIALIZE SETTINGS
  init(){
    return new Promise(function(resolve,reject){
      // Skip if store already initialized
      if(!this.initialized){
        // Create new data store
        this.db = new Datastore({ filename: this.dataFile, autoload: true });

        this.initDataRow(this.DATA_CREDENTIAL, this.credential)
        .bind(this)
        .then(function(result){
          if(result){
            this.credential = result;
          }
          return this.initDataRow(this.DATA_PORT, this.port);
        })
        .then(function(result){
          if(result){
            this.port = result;
          }
          this.initialized = true;
          resolve();
        });
      }
      else{
        resolve();
      }
    }.bind(this));
  }

  initDataRow(id, data){
    return new Promise(function(resolve,reject){
      this.db.findOne({id:id},function(err, doc){
        if(err)
          reject(err);
        else if(doc === null){
          var temp = Object.assign({id: id}, data);
          this.db.insert([temp]);
          resolve();
        }
        // If present get the values
        else{
          resolve(_.omit(doc, '_id'));
        }
      }.bind(this));
    }.bind(this));
  }

  setCredentials(machineId, token, channelId){
    return new Promise(function(resolve,reject){
      var temp = {
        machineId: machineId,
        token: token,
        channelId: channelId
      };
      this.db.update({id:this.DATA_CREDENTIAL}, {$set: temp}, function(err, numReplaced){
        if(err)
          reject(err);
        else {
          this.credential = temp;
          resolve();
        }
      }.bind(this));
    }.bind(this));
  }

  setPortName(name){
    this.port.comName = name;
  }
}
