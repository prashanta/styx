/*jshint esversion: 6 */

import path from 'path';
import tracer from 'tracer';
import pkg from '../../package.json';

var rootPath = path.normalize(__dirname + '/../..');
var env = process.env.NODE_ENV || 'development';

var _config = {
    development: {
        port: 5000, // server port
        logLevel: 'log',
        SERVER_URL: 'http://localhost:3000'
    },

    production: {
        port: 80,
        logLevel: 'warn',
        SERVER_URL: process.env.APP_SERVER_URL
    }
};

var config = _config[env];
console.log("Loading configurations for:", env);

config.name = pkg.name;
config.version = pkg.version;
config.root = rootPath;
config.NET_CHK_HOSTNAME = 'www.google.com';

config.REST_PATH_TOKEN_VALIDATE = '/api/v1/token/validate';
config.REST_PATH_MACHINE_ACTIVATE = '/api/v1/machines/activate';

config.ABLY_KEY = process.env.STYX_ABLY_KEY || 'rss_Lw.7ktoTg:0h0yF67nmvxI3tAQ';

config.logger = tracer.console({level:config.logLevel});

export default config;
