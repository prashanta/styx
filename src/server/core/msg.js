/*jshint esversion: 6 */

import Ably from 'ably';
import Promise from 'Bluebird';
import tracer from 'tracer';
import config from '../config';

var logger = tracer.console({level:config.logLevel});

export default class Msg{
    constructor(){
        this.channelId = null;
        this.channel = null;
        this.realtime = null;
    }

    initChannel(channelId){
        if(!this.channel){
            this.channelId = channelId;
            this.realtime = new Ably.Realtime({ key: config.ABLY_KEY });
            this.channel = this.realtime.channels.get(this.channelId);
            logger.log("channel initiated");
        }
    }

    publish(message){
        return new Promise(function(resolve,reject){
            if(this.channel){
                this.channel.publish('event', message, function(err) {
                    if(err) {
                        console.log('Unable to publish message; err = ' + err.message);
                    } else {
                        console.log('Message successfully sent');
                    }
                    resolve(1);
                });
            }
            else {
                reject(new Error("Channel not initialized"));
            }
        }.bind(this));
    }

}
