/*jshint esversion: 6 */

import fs from 'fs';
import path from 'path';
import config from '../config';

const logger = config.logger;

export default function(server){
  var routes = [];

  const scan = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
      if(fs.statSync(path.join(dir, file)).isDirectory())
        filelist =  scan(path.join(dir, file), filelist);
      else if((file.indexOf(".") !== 0) && (file !== "index.js"))
        filelist.push(path.join(dir, file));
    });
    return filelist;
  };

  scan(__dirname)
  .forEach(function(file) {
    var route = require(file);
    // Babel/ES6 module compatability
    if (typeof route === 'object' && route.__esModule)
    route = route['default'];
    routes.push(route);
  });

  logger.debug('ADDING ROUTES: ');
  routes.forEach(function(route) {
    route.forEach(function(api) {
      logger.debug(`${api.method} \t ${api.path}`);
      server.route(api);
    });
    console.log('\n');
  });
}
