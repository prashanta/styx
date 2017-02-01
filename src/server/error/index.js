/*jshint esversion: 6 */

import fs from 'fs';
import path from 'path';
import TypedError from 'error/typed';

var _errors = [];
var errors = {};

const scan = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    if(fs.statSync(path.join(dir, file)).isDirectory())
      filelist =  scan(path.join(dir, file), filelist);
    else if((file.indexOf(".") !== 0) && (file !== "index.js"))
      filelist.push(path.join(dir, file));
  });
  return filelist;
};

// Scan for error definitions
scan(__dirname)
.forEach(function(file) {
  var f = require(file);
  // Babel/ES6 module compatability
  if (typeof f === 'object' && f.__esModule)
    f = f['default'];
  Object.keys(f).forEach(function(key){
    _errors.push(f[key]);
  });
});

_errors.forEach(function(error) {
  errors[error.name] = TypedError(error);
});

export default errors;
