/* These following lines should be the topmost on any tests. */
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
var utils = require('./api-test-utils.js');
/*  end of top-lines  */

var app = require('../server.js');
var request = require('supertest');
var expect = require('chai').expect;

var clearMongoDB = utils.mongo.clearMongoDB;
var log = utils.log;

describe('DCL Tests', function() { // jshint ignore:line
    this.timeout(10000);

    before(function(done) { // jshint ignore:line
        log.info("Before doing Tests: Clearing MongoDB");
        clearMongoDB(done);
    });

    describe('User Model Tests', function() { // jshint ignore:line
        var testUser = {
            "name": "ravi",
            "password": "ravi123",
            "email": "ravi@example.com"
        };
        var testUserId;
        it('POST /api/Users', function(done) { // jshint ignore:line
            request(app)
                .post('/api/Users')
                .send(testUser)
                .set('Accept', 'application/json')
                .end(function(err, res) {
                    if (err) { return done(err); }
                    log.trace({body: res.body}, 'POST /api/Users: ');
                    expect(res.statusCode).to.equal(200, 'res.statusCode');
                    expect(res.body.id).to.be.a('string', 'res.body.id');
                    testUserId = res.body.id;
                    done();
                });
        });
        it('GET /api/Users/:id', function(done) { // jshint ignore:line
            request(app)
                .get('/api/Users/' + testUserId)
                .set('Accept', 'application/json')
                .end(function(err, res) {
                    if (err) { return done(err); }
                    log.debug({body: res.body}, 'GET /api/Users/:id: ');
                    expect(res.statusCode).to.equal(200, 'res.statusCode');
                    expect(res.body.name).to.equal(testUser.name, 'res.body.name');
                    done();
                });
        });
    });
});

