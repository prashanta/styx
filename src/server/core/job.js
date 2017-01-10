/*jshint esversion: 6 */
import tracer from 'tracer';
import request from 'request-promise';
import config from '../config';
import device from './device';

var logger = tracer.console({level:config.logLevel});

device.run();
