/*jshint esversion: 6 */
import Datastore from 'nedb';
import _ from 'underscore';
import Promise from 'bluebird';
import tracer from 'tracer';
import config from '../config';

var logger = tracer.console({level:config.logLevel});

export default class Store{
    constructor(){
        this.dataFile = config.root+'/datafile';
        logger.log(this.dataFile);

        this.token = '';
        this.umid = '';

        this.db = '';
    }

    init(){
        return new Promise(function(resolve,reject){
            this.db = new Datastore({ filename: this.dataFile, autoload: true });
            this.db.findOne({id:0},function(err, doc){
                logger.log(doc);
                if(doc === null){
                    logger.log("No settings found .. adding empty setting");
                    var temp = [{id: 0, token: '', umid: ''}];
                    this.db.insert(temp);
                }
                else{
                    this.token = doc.token;
                    this.umid = doc.umid;
                }
                resolve({token: this.token, umid: this.umid});
            }.bind(this));
        }.bind(this));
    }

    setCredentials(umid, token){
        return new Promise(function(resolve,reject){
            var temp = {
                umid: umid,
                token: token
            };
            this.db.update({id:0}, {$set: temp}, function(err, numReplaced){
                if(err)
                    reject(err);
                else {
                    logger.log("numReplaced: " + numReplaced);
                    this.umid = umid;
                    this.token = token;
                    resolve(numReplaced);
                }
            }.bind(this));
        }.bind(this));
    }
}
