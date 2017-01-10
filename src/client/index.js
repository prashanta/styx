/*jshint esversion: 6 */

import React from 'react';
import ReactDOM from 'react-dom';

import Layout from './components/app';
import Path from 'path';

fetch('/api/v1/settings', {method: 'get'})
.then(function(response){
    console.log(response);
});

ReactDOM.render(<Layout/>, document.getElementById('container'));
