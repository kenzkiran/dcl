var testLogConfig = {
    name: 'dcl-server-test',
    streams: [
        {
            level: 'trace',
            stream: process.stdout
        },
        {
            level: 'trace',
            path: './api-test/api-test.log'
        }
    ]
};
var log = require('../utils/logger.js')(testLogConfig);
/*
 Setting up Mongodb util functions.
 */
var MongoClient = require('mongodb').MongoClient;
var mongoTestDB = {
    "connector": "mongodb",
    "host": "localhost",
    "port": 27017,
    "database": "dcl-test"
};
var mongoString = mongoTestDB.connector + '://' + mongoTestDB.host + ':' + mongoTestDB.port + '/' + mongoTestDB.database;

var clearMongoDB = function(cb) {
    MongoClient.connect(mongoString, function(err, db) {
        if (err) {
            return cb(err);
        }
        db.dropDatabase(function(err, results) {
            if (err) {
                return cb(err);
            }
            log.trace({success: results}, "MongoDB dropped");
            db.close();
            cb(err);
        });
    });
};


var utils = {
    log: require('../utils/logger.js')(
    ),
    mongo: {clearMongoDB: clearMongoDB}
};

module.exports = utils;