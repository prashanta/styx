/*jshint esversion: 6 */

import Hapi from 'hapi';
import config from './config';
import Inert from 'inert';
import Routes from './routes';
import pjson from '../../package.json';
import device from './core/device';

var logger = config.logger;

logger.log(`Starting application ... ${config.name} - ${config.version}`);

const server = new Hapi.Server({debug:{request:['error']}});
server.connection({host:'localhost', port: config.port});
server.start((err)=>{
    if(err){
        throw err;
    }
    logger.log(`Server running at ${server.info.uri}`);

    // Start device
    device.run();
});


server.register([Inert], err=>{
    if(err)
        throw err;

    Routes(server);

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'public',
                listing: true
            }
        }
    });
});
