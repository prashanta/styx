/*jshint esversion: 6 */

import Joi from 'joi';
import Boom from 'boom';
import tracer from 'tracer';
import _ from 'underscore';
import config from '../../config';
import device from '../../core/device';

var logger = tracer.console({level:config.logLevel});

export default [
    // Get Settings
    {
        method: 'GET',
        path: '/api/v1/settings',
        handler: function(request, reply){
            reply("Hoday1");
        }
    },
    {
        method: 'GET',
        path: '/api/v1/register/{code}',
        handler: function(request, reply){
            device.registerDevice(request.params.code)
            .then(function(result){
                reply("Registration complete - " + result);
            });
        }
    }
];
