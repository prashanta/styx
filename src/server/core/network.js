
/*jshint esversion: 6 */

import config from '../config';
import dns from 'dns';

export function checkNetworkConnection(){
      return new Promise(function(resolve,reject){
          dns.resolve(config.NET_CHK_HOSTNAME, function(err, address){
              if(err){
                reject(err);
                console.log("Error in network");
              }else{
                  console.log("Network OK");
                  resolve();
              }
          }.bind(this));
      }.bind(this));
  }
