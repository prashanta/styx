/*jshint esversion: 6 */

import Joi from 'joi';
import Boom from 'boom';
import tracer from 'tracer';
import _ from 'underscore';
import config from '../../config';
import device from '../../core/device';

var logger = tracer.console({level:config.logLevel});

export default [
    // Activate machine with code provided by server
    {
        method: 'GET',
        path: '/api/v1/activate/{code}',
        handler: function(request, reply){
            device.activateMachine(request.params.code)
            .then(function(result){
                reply("Registration complete - " + result);
            })
            .catch(function(error){
                reply(error.message);
            });
        }
    },
    {
        method: 'GET',
        path: '/api/v1/settings',
        handler: function(request, reply){
            reply('Not implemented');
        }
    }
];
