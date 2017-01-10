/*jshint esversion: 6 */

import Hapi from 'hapi';
import config from './config';
import Inert from 'inert';
import Routes from './routes';
import pjson from '../../package.json';
import './core/job';

const server = new Hapi.Server({debug:{request:['error']}});

console.log(`Starting application ... ${config.name} - ${config.version}`);

server.connection({host:'localhost', port: config.port});

server.start((err)=>{
    if(err){
        throw err;
    }
    console.log(`Server running at ${server.info.uri}`);
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
