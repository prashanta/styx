/*jshint esversion: 6 */

import request from 'request-promise';
import Promise from 'bluebird';
import config from '../config';

var logger = config.logger;

// VALIDATE TOKEN
export function validateToken(machineId, token){
  return new Promise(function(resolve, reject) {
    request({
      uri: config.SERVER_URL + config.REST_PATH_TOKEN_VALIDATE,
      headers: {
        'Authorization': 'Bearer ' + token,
      },
      json: true
    })
    .then(function(result){
      if(result.result === 1) resolve(result);
      else reject(new Error('Something wrong, token could not be validated.'));
    })
    .catch(function(error){
      logger.error(error.message);
      reject(error);
    });
  });
}

// ACTIVATE MACHINE WITH SERVER
export function activateMachine(activationCode){
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
