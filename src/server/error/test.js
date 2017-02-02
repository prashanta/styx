/*jshint esversion: 6 */

var NetworkNotConnected = function (){
    this.message = "Network not connected";
    this.name = "NetworkNotConnected";
    Error.captureStackTrace(this, NetworkNotConnected);
};
NetworkNotConnected.prototype = Object.create(Error.prototype);
NetworkNotConnected.prototype.constructor = NetworkNotConnected;

var ServerNotFound = function (){
    this.message = "Server not found";
    this.name = 'ServerNotFound';
    Error.captureStackTrace(this, ServerNotFound);
};
ServerNotFound.prototype = Object.create(Error.prototype);
ServerNotFound.prototype.constructor = ServerNotFound;

var TokenNotValid = function (){
    this.message = "Token not valid. Activate again.";
    this.name = 'TokenNotValid';
    Error.captureStackTrace(this, TokenNotValid);
};
TokenNotValid.prototype = Object.create(Error.prototype);
TokenNotValid.prototype.constructor = TokenNotValid;

var SerialPortFault = function (){
    this.message = "Serial port error.";
    this.name = 'SerialPortFault';
    Error.captureStackTrace(this, SerialPortFault);
};
SerialPortFault.prototype = Object.create(Error.prototype);
SerialPortFault.prototype.constructor = SerialPortFault;

export default {
    NetworkNotConnected : NetworkNotConnected,
    ServerNotFound : ServerNotFound,
    TokenNotValid : TokenNotValid,
    SerialPortFault: SerialPortFault
};
