/*jshint esversion: 6 */

import request from 'request-promise';
import Promise from 'bluebird';
import tracer from 'tracer';
import config from '../config';

var logger = tracer.console({level:config.logLevel});

var client = {

    validateToken: function(machineId, token){
        return new Promise(function(resolve, reject) {
            request({
                uri: config.SERVER_URL + config.REST_PATH_TOKEN_VALIDATE,
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
                json: true
            })
            .then(function(result){
                logger.log(result);
                if(result.result === 1)
                    resolve(result);
                else
                    reject(new Error('Something went wrong'));
            })
            .catch(function(error){
                logger.error(error.message);
                reject(error);
            });
        });
    },

    activateMachine: function(activationCode){
        return new Promise(function(resolve, reject) {
            request({
                uri: config.SERVER_URL + config.REST_PATH_MACHINE_ACTIVATE + '/' + activationCode,
                json: true
            })
            .then(function(result){
                resolve(result);
            })
            .catch(function(error){
                reject(error);
            });
        });
    }
};

export default client;
