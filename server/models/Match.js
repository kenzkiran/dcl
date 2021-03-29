/**
 * Created by rramachandra on 2016-06-25.
 */

var log = require('../utils/logger.js')();
var matchUtils = require('../utils/match-utils.js');
var MATCH_SCORESHEET_STATUS = matchUtils.MATCH_SCORESHEET_STATUS;

module.exports = function(Match) {
    log.info("Inside Match Model");

    /***
     * Get's innings and it's batting and bowling scores
     * @param id {ObjectId} Innings id whoes batting and bowling scores are to be extracted
     * @param cb {callback} standard callback
     */
    var getInnings = function(id, cb) {
        var Inning = Match.app.models.Inning;
        Inning.findById(id, function(err, inning) {
            if (err ||  !inning) {
               log.error("Error in getInnings for inning id:", id);
               return cb(err, inning);
            }
            //log.info("Found the Inning :", inning.id);
            // Get batting scores for the inning
            inning.batting({"include": ["batsman", "bowler", "fielder"], "order": "sequence ASC"} ,function(err, batScores) {
                //log.info("Found batting scores: ", bs);
                var newInning = inning.toJSON();
                newInning.battingScores = batScores.map(function(batScore) {
                   return batScore.toJSON();
                });

                // now we need bowling scores
                inning.bowling({"include": ["bowler"], "order": "sequence ASC"}, function(err, bowlScores) {
                    newInning.bowlingScores = bowlScores.map(function(bowlScore) {
                        return bowlScore.toJSON();
                    });
                    return cb(null, newInning);
                });
            });
        });
    };


    /***
     * Resets match status in case of errors
     * @param m (Object)
     */
    function resetMatchDetails(match) {
        match.result = null;
        match.tossChoice = null;
        match.momDesc = null;
        match.status = null;
        match.momId = null;
        match.tossWinnerId = null;
        match.winTeamId = null;
        match.inningOneId = null;
        match.inningTwoId = null;
        match.lock = false;
        match.scoreSheetStatus = "none";
    }

    /***
     * Find Inning and Cleanup.
     * @param inningId
     * @param cb
     * @returns {*}
     */
    var cleanMatchInning = function(inningId, cb) {
        if (!inningId) {
            return cb(null);
        }
        var Inning = Match.app.models.Inning;
        Inning.findById(inningId, function(err, inning) {
            if (err || !inning) {
                if (err) {log.error("Error in Finding Inning with id:", inningId, err); }
                if (!inning) {log.info("No inning found for id:" + inningId);}
                return cb(err);
            }
            inning.cleanUp(cb);
        });
    };
    /***
     * Provide scoresheet for match id if available.
     * @param id {ObjectId} Id of the match
     * @param cb {callback} Standard callback with args: err, result
     */
    Match.scoreSheet = function(id, cb) {
        Match.findById(id, {"include" : ["teamOne","teamTwo","ground","umpireOne","umpireTwo"]}, function(err, match) {
            if (err && !match) {
                return cb(err, match);
            }

            //log.info("Found match: ", match);
            // Now that we found match, see if the scoresheet is submitted ??
            if (match.scoreSheetStatus !== MATCH_SCORESHEET_STATUS.SUBMIT) {
                return cb(new Error("Match Score Not Submitted"), match);
            }

            // check if we have inning ids'
            if (!match.inningOneId) {
                return cb(new Error("Match InningOneId missing"));
            }
            if (!match.inningTwoId) {
                return cb(new Error("Match InningTwoId missing"));
            }

            // now fetch Innings and their bowling and batting scores
            getInnings(match.inningOneId, function(err, inning1) {
                var newMatch = match.toJSON();
                if (err || !inning1) {
                    return cb(err, newMatch);
                }
                newMatch.inningOne = inning1;
                //log.info("Received Inning", newMatch);
                getInnings(match.inningTwoId, function(err, inning2) {
                    if (err || !inning2) {
                        return cb(err, newMatch);
                    }
                    newMatch.inningTwo = inning2;
                    console.log(newMatch);
                    return cb(null, newMatch);
                });
            });

        });
    };

    Match.deleteScoreSheet = function(id, cb) {
        var Inning = Match.app.models.Inning;
        log.info('Deleting scoresheet for Match: id');
        Match.findById(id, function(err, match) {
            if (err && !match) {
                return cb(err, match);
            }
            //log.info("Found match: ", match);
            // Now that we found match, see if the scoresheet is submitted ??
            if (match.scoreSheetStatus !== MATCH_SCORESHEET_STATUS.SUBMIT) {
                return cb(new Error("Match Score Not Submitted"), match);
            }
            // clean Both Inning
            var errorList = [];
            cleanMatchInning(match.inningOneId, function(err) {
                if (err) {
                    errorList.push(err);
                }
                Inning.destroyById(match.inningOneId, function(e) {
                    log.info("Destroyed inningId: ", match.inningOneId, e);
                });
                cleanMatchInning(match.inningTwoId, function(er) {
                    if (er) {
                        errorList.push(er);
                    }
                    //TODO: do we wait ??
                    Inning.destroyById(match.inningTwoId, function(e) {
                        log.info("Destroyed inningId: ", match.inningTwoId, e);
                    });

                    // set them to null
                    match.inningTwoId = null;
                    match.inningOneId = null;
                    if (errorList.count) {
                        match.scoreSheetStatus = MATCH_SCORESHEET_STATUS.NEED_RESET;
                        match.save();
                        cb(new Error("Error deleting MatchScoreSheet", errorList));
                    } else {
                        // just reset details
                        resetMatchDetails(match);
                        match.scoreSheetStatus = MATCH_SCORESHEET_STATUS.NONE;
                        match.save();
                        cb(null, {result: 'success'});
                    }
                });
            });
        });

        };
    /**
     * Add remoted method to retrieve scoresheet
     */
    Match.remoteMethod(
        'scoreSheet',
        {
            description: "Get ScoreSheet for Match",
            accepts: [
                {arg: 'id', type: 'string', required: true}
            ],
            returns: {arg: 'scoreSheet', type: 'object', root: true},
            http: {path: '/:id/scoreSheet', verb: 'get'}
        }
    );
    
    /**
     * Add remoted method to remove scoresheet
     */
    Match.remoteMethod(
        'deleteScoreSheet',
        {
            description: "Remove ScoreSheet for Match",
            accepts: [
                {arg: 'id', type: 'string', required: true}
            ],
            returns: {arg: 'scoreSheet', type: 'object', root: true},
            http: {path: '/:id/deleteScoreSheet', verb: 'post'}
        }
    );
};
