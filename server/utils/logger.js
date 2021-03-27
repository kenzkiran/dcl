var bunyan = require('bunyan');
var logger;

var createLogger = function(config) {
    if (logger) {
        return logger;
    }

    var defConfig = {
        name: 'dcl-server',
        stream: process.stdout,
        level: 'info'
    };
    config = config || defConfig;
    logger = bunyan.createLogger(config);
    return logger;
};

module.exports = createLogger;