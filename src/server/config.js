/*jshint esversion: 6 */

import path from 'path';
import pkg from '../../package.json';

var rootPath = path.normalize(__dirname + '/../..');
var env = process.env.NODE_ENV || 'development';

var _config = {
    development: {
        port: 5000, // server port
        logLevel: 'log',
        serverUrl: 'http://localhost:3000'
    },

    production: {
        port: 80,
        logLevel: 'warn',
        serverUrl: process.env.APP_SERVER_URL
    }
};

var config = _config[env];
console.log("Loading configurations for:", env);

config.name = pkg.name;
config.version = pkg.version;
config.root = rootPath;

export default config;
