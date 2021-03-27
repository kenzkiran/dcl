var statsEngine = require('../utils/stats-engine.js');
var log = require('../utils/logger.js')();

module.exports = function(Tournament) {

    Tournament.stats = function(id, cb) {
        Tournament.findById(id, function(err, tournament) {
           if (err || !tournament) {
               return cb(err);
           }
           var filter =
           {"include": [
               {"teamOne": {}}, {"teamTwo": {}},
               {"inningTwo": [
                   {"batting": "batsman"}, {"bowling": "bowler"}]
               },
               {"inningOne": [
                   {"batting": "batsman"}, {"bowling": "bowler"}]
               }
            ]};

           tournament.matches(filter, function(err, m) {
               log.info("Tourney Matches: ", m);
               cb(null, statsEngine.tournamentStats(m));
           });
        });
    };


    Tournament.addOrRemoveTeamBy = function(id, teamId, shouldAdd, cb) {
        var Team = Tournament.app.models.Team;
        log.info({id: id}, "Received tournament id: ");
        log.info({teamId: teamId}, "Received teamId: ");
        Tournament.findById(id, function(err, tourney) {
            if (err || !tourney) {
                console.log("Did not find the tourney");
                return cb(new Error("Invalid Tournament Id"));
            }

            if(shouldAdd) {
                console.log("Found Tournament, now adding team");
            } else {
                console.log("Found Tournament, now removing team");
            }

            tourney.teams.findById(teamId, function(err, team) {
                if (team && shouldAdd) {
                    return cb(null, team);
                }
                Team.findById(teamId, function(err, team){
                    if (err || !team) {
                        return cb(new Error("Did not find team"))
                    }

                    if (shouldAdd) {
                        return tourney.teams.add(team, cb);
                    }
                    return tourney.teams.remove(team, cb);

                });
            });
        });
    };


    Tournament.addTeamById = function(id, teamId, cb) {
        Tournament.addOrRemoveTeamBy(id, teamId, true, cb);
    };


    Tournament.removeTeamById = function(id, teamId, cb) {
        Tournament.addOrRemoveTeamBy(id, teamId, false, cb);
    };

    Tournament.getPenalties = function(id, cb) {
        var Roaster = Tournament.app.models.Roaster;
        Roaster.find({where: {tournamentId: id}, include: ["penalties", "team"]}, function(err, penalties) {
            var result = {penalties: penalties || []};
            cb(err, result);
        });
    };

    Tournament.addPenalty = function(id, teamId, penalty, cb) {
        var Roaster = Tournament.app.models.Roaster;
        Roaster.find({where: {tournamentId: id, teamId : teamId}}, function(err, roasters) {
           if (!err && roasters) {
               if (roasters.length > 0) {
                   console.log("Creating Penalty for tourney Id & team Id:", id, teamId, penalty);
                   return roasters[0].penalties.create(penalty, cb);
               } else {
                   return cb(new Error("Error Creating Penalty Model: tournamentId: " + id + "  teamId : " + teamId));
               }
           }
           cb(err);
        });

    };

    /**
     * Add remoted method to get all batting scores and bowling score for the
     * tournament
     */
    Tournament.remoteMethod(
        'stats',
        {
            description: "Get All Stats for the tournament",
            accepts: [
                {arg: 'id', type: 'string', required: true}
            ],
            returns: {arg: 'result', type: 'object', root: true},
            http: {path: '/:id/stats', verb: 'get'}
        }
    );

    /**
     * Add remoted method to add a team to a tournament
     */
    Tournament.remoteMethod(
        'addTeamById',
        {
            description: "Add Team to a tournament",
            accepts: [
                {arg: 'id', type: 'string', required: true},
                {arg: 'teamId', type: 'string', required: true}
            ],
            returns: {arg: 'result', type: 'object', root: true},
            http: {path: '/:id/addTeamById', verb: 'post'}
        }
    );

    /**
     * Add remoted to remove a team from tournament
     */
    Tournament.remoteMethod(
        'removeTeamById',
        {
            description: "Remove Team from a tournament",
            accepts: [
                {arg: 'id', type: 'string', required: true},
                {arg: 'teamId', type: 'string', required: true}
            ],
            returns: {arg: 'result', type: 'object', root: true},
            http: {path: '/:id/removeTeamById', verb: 'post'}
        }
    );

    /**
     * Add remoted to remove a team from tournament
     */
    Tournament.remoteMethod(
        'addPenalty',
        {
            description: "Add Penalty for a team in tournament",
            accepts: [
                {arg: 'id', type: 'string', required: true},
                {arg: 'teamId', type: 'string', required: true},
                {arg: 'penalty', type: 'object', required: true}
            ],
            returns: {arg: 'result', type: 'object', root: true},
            http: {path: '/:id/addPenalty', verb: 'post'}
        }
    );

    /**
     * Add remoted to remove a team from tournament
     */
    Tournament.remoteMethod(
        'getPenalties',
        {
            description: "Get Penalties/Bonuses for the tournament",
            accepts: [
                {arg: 'id', type: 'string', required: true}
            ],
            returns: {arg: 'result', type: 'object', root: true},
            http: {path: '/:id/getPenalties', verb: 'get'}
        }
    );
};