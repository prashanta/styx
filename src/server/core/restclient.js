/*jshint esversion: 6 */

import request from 'request-promise';
import Promise from 'bluebird';
import config from '../config';
import Errors from '../error';

var logger = config.logger;

// VALIDATE TOKEN
export function validateToken(credential){
  return new Promise(function(resolve, reject) {
    request({
      uri: config.SERVER_URL + config.REST_PATH_TOKEN_VALIDATE,
      headers: {'Authorization': 'Bearer ' + credential.token},
      json: true
    })
    .then(function(result){
      if(result.result === 1)
        resolve(result);
      else
        reject(new Err.ServerNotFound());
    })
    .catch(function(error){
      if(error.name === 'RequestError')
        reject(new Errors.ServerNotFound());
      else if(error.name === 'StatusCodeError'){
        if(error.statusCode === 401)
          reject(new Errors.TokenNotValid());
        else
          reject(error);
      }
      else
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
