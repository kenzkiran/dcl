/**
 * Created by kenzkiran on 6/12/15.
 */

var app = require('../server.js');
var request = require('supertest');
var async = require('async');
var log = require('../utils/logger.js')();

var addResource = function(resource, type, endPoint, cb) {
    request(app)
        .post(endPoint)
        .send(resource)
        .set('Accept', 'application/json')
        .end(function(err, res) {
            if(res.statusCode !== 200) {
                return cb(new Error("Error adding " + type + " : " + JSON.stringify(resource)));
            }
            return cb(null, res.body);
        });
};
var addUser = function(user, cb) {
    return addResource(user, 'User', '/api/Users', cb);
};

var addUsers = function(users, cb) {
    async.filterSeries(users,
        function(user, done) {
            addUser(user, function(err, u) {
                if (!err) {
                    user.id = u.id;
                    log.info({user: u}, "Added user: ");
                    return done(true);
                }
                done(false);
            });
        },
        function(results) {
            if (results.length !== users.length)
                return cb(new Error("Error in adding Users"));
            return cb(null);
        });
};

var addPlayer = function(player, cb) {
    return addResource(player, 'Player', '/api/Players', cb);
};

var addPlayers = function(players, cb) {
    var i = 0;
    async.filterSeries(players,
        function(player, done) {
            player.userId = users[i++].id;
            addPlayer(player, function(err, p) {
                if (!err) {
                    player.id = p.id;
                    log.info({player: p}, "Added Player: ");
                    return done(true);
                }
                done(false);
            });
        },
        function(results) {
            if (results.length !== players.length)
                return cb(new Error("Error in adding Players"));
            return cb(null);
        });
};

var addTeam = function(team, cb) {
    return addResource(team, 'Team', '/api/Teams', cb);
};

var addTeams = function(teams, cb) {
    async.filterSeries(teams,
        function(team, done) {
            addTeam(team, function(err, t) {
                if (!err) {
                    team.id = t.id;
                    log.info({team: t}, "Added Team: ");
                    return done(true);
                }
                done(false);
            });
        },
        function(results) {
            if (results.length !== teams.length)
                return cb(new Error("Error in adding Teams"));
            return cb(null);
        });
};

var addDivision = function(team, cb) {
    return addResource(team, 'Division', '/api/Divisions', cb);
};

var addDivisions = function(divisions, cb) {
    async.filterSeries(divisions,
        function(div, done) {
            addDivision(div, function(err, d) {
                if (!err) {
                    div.id = d.id;
                    log.info({div: d}, "Added Div: ");
                    return done(true);
                }
                done(false);
            });
        },
        function(results) {
            if (results.length !== divisions.length)
                return cb(new Error("Error in adding Divs"));
            return cb(null);
        });
};

var addGameType = function(gameType, cb) {
    return addResource(gameType, 'GameType', '/api/GameTypes', cb);
};

var addGround = function(ground, cb) {
    return addResource(ground, 'Grounds', '/api/Grounds', cb);
};

var addTournamentType = function(tournamentType, cb) {
    return addResource(tournamentType, 'tournamentType', '/api/TournamentTypes', cb);
};


var addTournament = function(tournament, cb) {
    return addResource(tournament, 'tournament', '/api/Tournaments', cb);
};

var addInning = function(inning, cb) {
    return addResource(inning, 'Inning', '/api/Innings', cb);
};

var addInnings = function(innings, cb) {
    async.filterSeries(innings,
        function(inn, done) {
            addInning(inn, function(err, i) {
                if (!err) {
                    inn.id = i.id;
                    log.info({inning: i}, "Added Inning: ");
                    return done(true);
                }
                done(false);
            });
        },
        function(results) {
            if (results.length !== innings.length)
                return cb(new Error("Error in adding Innings"));
            return cb(null);
        });
};

var addBattingScore = function(battingScore, cb) {
    log.info({bs: battingScore}, "Adding bs: ");
    return addResource(battingScore, 'BattingScore', '/api/BattingScores', cb);
};

var addBattingScores = function(battingScores, cb) {
    async.filterSeries(battingScores,
        function(battingScore, done) {
            addBattingScore(battingScore, function(err, bs) {
                if (!err) {
                    battingScore.id = bs.id;
                    log.info({battingScore: bs}, "Added BattingScore: ");
                    return done(true);
                }
                done(false);
            });
        },
        function(results) {
            if (results.length !== battingScores.length)
                return cb(new Error("Error in adding BattingScores"));
            return cb(null);
        });
};

var associateTournamentToGTandTT = function(tournament, division, gameType, tournamentType, cb) {
    var updatedTournament = {
        gameTypeId: gameType.id,
        divisionId: division.id,
        typeId: tournamentType.id
    };
    request(app)
        .put('/api/Tournaments/' + tournament.id)
        .send(updatedTournament)
        .set('Accept', 'application/json')
        .end(function(err, res) {
            if (err) {
                log.error("Error in Associating tournament with other related models");
                return cb(err);
            }
            log.info({tournament: res.body}, "AssociatedTournament: ");
            return cb(null, res.body);
        });
};

var users = [
    {"name": "ravi", "password": "pass", "email": "ravi@example.com"},
    {"name": "anil", "password": "pass", "email": "anil@example.com"},
    {"name": "dravid", "password": "pass", "email": "dravid@example.com"},
    {"name": "srinath", "password": "pass", "email": "srinath@example.com"},
    {"name": "joshi", "password": "pass", "email": "joshi@example.com"},
    {"name": "sachin", "password": "pass", "email": "sachin@example.com"},
    {"name": "vvs", "password": "pass", "email": "vvs@example.com"},
    {"name": "grv", "password": "pass", "email": "grv@example.com"},
    {"name": "devillers", "password": "pass", "email": "devillers@example.com"},
    {"name": "lara", "password": "pass", "email": "lara@example.com"}
];

var players = [
    { "userId": "", "firstName": "Ravikiran", "lastName": "Ramachandra"},
    { "userId": "", "firstName": "Anil", "lastName": "Kumble"},
    { "userId": "", "firstName": "Rahul", "lastName": "Dravid"},
    { "userId": "", "firstName": "Javagal", "lastName": "Srinath"},
    { "userId": "", "firstName": "Sunil", "lastName": "Joshi"},
    { "userId": "", "firstName": "Sachin", "lastName": "Tendulkar"},
    { "userId": "", "firstName": "VVS", "lastName": "Laxman"},
    { "userId": "", "firstName": "Gundappa", "lastName": "Vishwanath"},
    { "userId": "", "firstName": "AB", "lastName": "Devillers"},
    { "userId": "", "firstName": "Brian", "lastName": "Lara"}
];

var teams = [
    {"name": "Gladiators", "location": "plano"},
    {"name": "Panthers", "location": "richardson"}
];

var divisions = [
    {"name": "Div A", "ageGroup": "Professional"},
    {"name": "Div A", "ageGroup": "U16"},
    {"name": "Div B", "ageGroup": "U19"}
];

var gameTypes = [
    {"name": "Tape"}
];

var grounds = [
    {"name": "Russel Creek - G1", "city": "Allen"},
    {"name": "Allen on Alma", "city": "Allen"}
];

var tournamentTypes = [
    {"name": "Summer League"}
];

var tournaments = [
    {"name": "Summer 2015", "startDate": "04/02/2011"}
];

var innings = [
    {"order": "1", "total": "130"},
    {"order": "2", "total": "131"}
];

var battingScores = [
    { "status": "caught", "runs": 10, "balls": 10, "four": 0, "six": 0},
    { "status": "bowled", "runs": 24, "balls": 0, "four": 4, "six": 0},
    { "status": "caught", "runs": 30, "balls": 0, "four": 0, "six": 0},
    { "status": "caught", "runs": 11, "balls": 10, "four": 0, "six": 0},
    { "status": "bowled", "runs": 25, "balls": 0, "four": 4, "six": 0},
    { "status": "caught", "runs": 31, "balls": 0, "four": 0, "six": 3}
];

var associateBattingScore = function(bsId, actors, cb) {
    request(app)
        .put('/api/BattingScores/' + bsId)
        .send(actors)
        .set('Accept', 'application/json')
        .end(function(err, res) {
            if (err) {
                log.error("Error in Associating BattingScore with other related models");
                return cb(err);
            }
            log.info({battingScore: res.body}, "Associated BattingScore: ");
            return cb(null, res.body);
        });
};

var associateBattingScores = function(battingScores, cb) {
  var indexes = [
      {fielder: 0, bowler: 1, player: 5, inning: 0},
      {fielder: 2, bowler: 3, player: 6, inning: 0},
      {fielder: 3, bowler: 4, player: 7, inning: 0},
      {fielder: 5, bowler: 6, player: 0, inning: 1},
      {fielder: 7, bowler: 8, player: 1, inning: 1},
      {fielder: 9, bowler: 8, player: 2, inning: 1}
    ];
    var i = 0;
    async.filterSeries(battingScores,
        function(battingScore, done) {
            var actors = {
              fielderId: players[indexes[i].fielder].id,
              bowlerId: players[indexes[i].bowler].id,
              playerId: players[indexes[i].player].id,
              inningId: innings[indexes[i++].inning].id
            };
            associateBattingScore(battingScore.id, actors, function(err) {
                if (err) return done(false);
                return done(true);
            });
        },
        function(results) {
            if (results.length !== battingScores.length)
                return cb(new Error("Error in associating batting scores"));
            return cb(null);
        });

};
var associatePlayerToTeam = function(playerId, teamId, cb) {
    request(app)
        .post('/api/Players/' + playerId + '/addTeamById?teamId=' + teamId)
        .set('Accept', 'application/json')
        .end(function(err, res) {
            if(res.statusCode !== 200) {
                if (res.body) {
                    log.error({error: res.body}, "Error in associatePlayerToTeam: ");
                }
                return cb(new Error("Error in associatePlayerToTeam"));
            }
            return cb(null, res.body);
        });
};

var associatePlayersToTeams = function(cb) {
    var i = 0;
    async.filterSeries(players,
        function(player, done) {
            var teamId = (i++ < players.length/2) ? teams[0].id: teams[1].id;
            associatePlayerToTeam(player.id, teamId, function(err) {
                if (err) return done(false);
                return done(true);
            });
        },
        function(results) {
            if (results.length !== players.length)
                return cb(new Error("Error in adding Players"));
            return cb(null);
        });
};

async.waterfall([
    function(next) {
        addUsers(users, next);
    },
    function(next) {
        addTeams(teams, next);
    },
    function(next) {
        addPlayers(players, next);
    },
    function(next) {
        addDivisions(divisions, next);
    },
    function(next) {
        addGameType(gameTypes[0], function(err, gt) {
            if(!err) gameTypes[0].id = gt.id;
            next(err);
        });
    },
    function(next) {
        addTournamentType(tournamentTypes[0], function(err, tt) {
            if(!err) tournamentTypes[0].id = tt.id;
            next(err);
        });
    },
    function(next) {
        addTournament(tournaments[0], function(err, t) {
            if(!err) tournaments[0].id = t.id;
            next(err);
        });
    },
    function(next) {
        addGround(grounds[0], function(err, g) {
            if(!err) grounds[0].id = g.id;
            next(err);
        });
    },
    function(next) {
        associateTournamentToGTandTT(tournaments[0], divisions[0], gameTypes[0], tournamentTypes[0], function(err, t) {
            next(err);
        });
    },
    function(next) {
        associatePlayersToTeams(next);
    },
    function(next) {
        addInnings(innings, next);
    },
    function(next) {
        addBattingScores(battingScores, next);
    },
    function(next) {
        associateBattingScores(battingScores, next);
    }
], function (err, result) {
    if (err) {
        log.error({err: err}, "Error in adding test data");
    } else {
        log.info("Added all the test data");
    }
});

