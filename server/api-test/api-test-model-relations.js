/**
 * Created by rramachandra on 2015-06-10.
 */

/* These following lines should be the topmost on any tests. */
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
var utils = require('./api-test-utils.js');
/*  end of top-lines  */

var app = require('../server.js');
var request = require('supertest');
var expect = require('chai').expect;

var clearMongoDB = utils.mongo.clearMongoDB;
var log = utils.log;


var addResource = function(resource, type, endPoint, cb) {
    request(app)
        .post(endPoint)
        .send(resource)
        .set('Accept', 'application/json')
        .end(function(err, res) {
            if (res.statusCode !== 200) {
                return cb(new Error("Error adding " + type + " : " + JSON.stringify(resource)));
            }
            return cb(null, res.body);
        });
};
var addUser = function(user, cb) {
    return addResource(user, 'User', '/api/Users', cb);
};

var addPlayer = function(player, cb) {
    return addResource(player, 'Player', '/api/Players', cb);
};

describe('DCL Model Relationship Tests', function() { // jshint ignore:line
    this.timeout(10000);
    var testUser = {
        "name": "ravi",
        "password": "ravi123",
        "email": "ravi@example.com"
    };

    var testPlayer = {
        "userId": "",
        "firstName": "Ravikiran",
        "lastName": "Ramachandra"
    };

    before(function(done) { // jshint ignore:line
        log.info("Before doing Tests: Clearing MongoDB");
        clearMongoDB(function(err) {
            if (err) {
                log.error('Error in clearing MongoDB');
                done();
            }
            addUser(testUser, function(err, user) {
                if (err) { return done(err); }
                log.info({user: user}, "Added new user: ");
                testPlayer.userId = user.id;
                addPlayer(testPlayer, function(err, player) {
                    if (err) { return done(err); }
                    testPlayer = player;
                    log.info({player: player}, "Added new player: ");
                    done();
                });
            });
        });
    });

    it('Player belongsTo User as owner', function(done) { // jshint ignore:line

        var filter = '{"include":"owner"}';
        var uri = '/api/Players/' + testPlayer.id + '?filter=' + encodeURIComponent(filter);
        log.debug({uri: uri}, "GET ");
        request(app)
            .get(uri)
            .set('Accept', 'application/json')
            .end(function(err, res) {
                if (err) { return done(err); }
                log.debug({uri: uri, body: res.body}, 'res.body: ');
                expect(res.statusCode).to.equal(200, 'res.statusCode');
                expect(res.body.owner.email).to.equal(testUser.email, 'res.body.owner.email');
                done();
            });
    });

});