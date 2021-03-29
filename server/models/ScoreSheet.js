var _ = require('underscore');
var Q = require('q');
var async = require('async');
var log = require('../utils/logger.js')();
var ObjectID = require('mongodb').ObjectID;

var matchUtils = require('../utils/match-utils.js');
var MATCH_SCORESHEET_STATUS = matchUtils.MATCH_SCORESHEET_STATUS;


module.exports = function(ScoreSheet) {

    function scoreSheetSubmitted(matchId) {
        // delete the scoresheet for a submitted match
        setTimeout(function() {
            log.info("Scoresheet destroy all with matchId: ", matchId);
            ScoreSheet.destroyAll({matchId: matchId}, function(err, info) {
                if (err) {
                    log.info("Error in deleting Scoresheet with matchId", matchId);
                }
            });
        }, 500);

    }
    function convertStringToId(stringId) {
        /*
        if ( (_.isString(stringId) && stringId.length > 0)) {
            return new ObjectID(stringId);
        }*/
        return stringId;
    }
    /**
     * For save this just updates the match.scoreSheetStatus to "saved"
     * @param scoreSheet
     * @param done
     * @returns {*}
     */
    function handleSave(scoreSheet, done) {
        scoreSheet.match(function(err, m) {
            if (!err && m) {
                changeMatchScoreSheetStatus(m, MATCH_SCORESHEET_STATUS.SAVED, true);
            }
            return done(err);
        });
    }

    /***
     * Changes Match ScoreSheet Status
     * @param match {object} This is the persistant model object
     * @param status {string}
     * @param forceSave {true/false}
     */
    function changeMatchScoreSheetStatus(match, status, forceSave) {
        forceSave = forceSave || false;
        if (match && status) {
            match.scoreSheetStatus = status;
            if (forceSave) {
                match.save();
            }
        }
    }

    function _updateMatchFromScoreSheet(m, scoreSheet) {
        m.result = scoreSheet.score.result;
        m.tossChoice = scoreSheet.score.tossChoice;
        m.momDesc = scoreSheet.score.momDesc;
        m.status = scoreSheet.score.status;
        m.momId = scoreSheet.score.momId;
        m.tossWinnerId = scoreSheet.score.tossWinnerId;
        m.winTeamId = scoreSheet.score.winTeamId;
    }
    /***
     * Updates Match's scoresheetStatus
     * @param scoreSheet: {object} scoreSheet
     * @param cb {Callback} function with params: err, obj
     */
    function updateMatchDetails(scoreSheet, forceSave, cb) {
        scoreSheet.match(function(err, m) {
            if (!err && m) {
                _updateMatchFromScoreSheet(m, scoreSheet);
                if (!forceSave) {
                    return cb(null, m);
                }
                m.save(function (err, m) {
                    if (!err) {
                        log.info('updateMatchDetails: Match Status Updated to:' + status);
                    }
                    return cb(err, m);
                });
            } else {
                var errorMsg = 'Error: updateMatchDetailsMatch: Match Not Found with id: ' + matchId;
                log.error(errorMsg);
                cb(new Error(errorMsg));
            }
        });
    }

    function createInning(inning) {
        log.info("Creating new Inning : ", inning);
        var defer = Q.defer();
        var Inning = ScoreSheet.app.models.Inning;
        if (inning.id) {
            inning.id = convertStringToId(inning.id);
        } else {
            delete inning.id;
        }
        inning.battingTeamId = convertStringToId(inning.battingTeamId);
        inning.bowlingTeamId = convertStringToId(inning.bowlingTeamId);
        log.info("Now upserting inning: ", inning);
        process.nextTick(function() {
            Inning.upsert(inning, function(err, inn) {
                if (!err && inn) {
                    log.info("New Inning created: " + inn.id);
                    defer.resolve(inn);
                } else {
                    log.error("Error creating Inning");
                    defer.reject(new Error("Error Creating Inning" + inn.order));
                }
            });
        });
        return defer.promise;
    }

    function createBattingScores(battingScores) {
        var defer = Q.defer();
        if (!Array.isArray(battingScores)) {
            battingScores = [battingScores];
        }
        var BattingScore = ScoreSheet.app.models.BattingScore;
        var newBattingScores = [];
        //log.info("Now creating Batting Scores", battingScores);
        async.eachSeries(battingScores, function(bs, cb) {
            log.info("Now creating Batting Score: ", bs);
            BattingScore.updateOrCreate(bs, function(err, newBS) {
                if (err || !newBS) {
                    log.info("Error in creating batting score");
                    return cb(null, false);
                }
                newBattingScores.push(newBS);
                return cb(null, true);
            });
        }, function(err, result) {
            if (!err) {
                log.info("Batting Score Creating Success");
                return defer.resolve(newBattingScores);
            }
            log.error("Error in Batting Scores: ", err);
            defer.reject(new Error("Error Creating Batting Scores"));
        });
        return defer.promise;
    }


    function createBowlingScores(bowlingScores) {
        var defer = Q.defer();
        if (!Array.isArray(bowlingScores)) {
            bowlingScores = [bowlingScores];
        }
        var BowlingScore = ScoreSheet.app.models.BowlingScore;
        var newBowlingScores = [];
        async.eachSeries(bowlingScores, function(bs, cb) {
            log.info("Now creating Bowling Score: ", bs);
            BowlingScore.updateOrCreate(bs, function(err, newBS) {
                if (err || !newBS) {
                    log.error("Error in creating Bowling Score");
                    return cb(null, false);
                }
                newBowlingScores.push(newBS);
                return cb(null, true);
            });
        }, function(err, result) {
            if (!err) {
                log.info("Bowling Score Creating Success");
                return defer.resolve(newBowlingScores);
            }
            log.error("Error in Bowling Scores: ", err);
            defer.reject(new Error("Error Creating Bowling Scores"));
        });
        return defer.promise;
    }

    function formatBowlingScores(bowlingScores, inningId, tourneyId) {
        //log.info('Formatting bowling scores');
        return bowlingScores.map(function(beforeBS) {
            var afterBS = _.omit(beforeBS, "bowler");
            afterBS.inningId = inningId;
            afterBS.tournamentId = tourneyId;
            afterBS.id = convertStringToId(beforeBS.id);
            afterBS.bowlerId = convertStringToId(beforeBS.bowlerId);
            //log.info("BowlingScore Formatted:", afterBS);
            return afterBS;
        });
    }

    function formatBattingScores(battingScores, inningId, tourneyId) {
        //log.info('Formatting batting scores');
        return battingScores.map(function(beforeBS) {
            var afterBS = _.pick(beforeBS, "sequence", "status", "runs", "four", "six", "balls");
            afterBS.inningId = inningId;
            afterBS.tournamentId = tourneyId;
            afterBS.id = convertStringToId(beforeBS.id);
            afterBS.batsmanId = convertStringToId(beforeBS.batsmanId);
            afterBS.bowlerId = convertStringToId(beforeBS.bowlerId);
            afterBS.fielderId = convertStringToId(beforeBS.fielderId);
            //log.info("BattingScore Formatted:", afterBS);
            return afterBS;
        });
    }

    /***
     * Extracts battingScores and bowlingScores and save them into respective tables
     * @param scoreInning
     * @returns {*}
     */
    function splitAndStoreInning(scoreInning, tourneyId) {
        var defer = Q.defer();
        log.info("Split And Store Innings:", scoreInning.id);
        var inning = _.pick(scoreInning,"id", "numPlayers", "order", "notes", "revisedTotal",
            "maxOvers", "byes", "legbyes", "totalRuns", "runRate", "totalOvers", "battingTeamId", "bowlingTeamId");
        var newInnings = {};
        createInning(inning)
            .then(function(inn) {
                newInnings = inn;
                // need to do this because the fields sent are slightly different than what is stored
                // also inning id need to be updated.
                var formattedBS = formatBattingScores(scoreInning.battingScores, newInnings.id, tourneyId);
                //log.info("Formated BS: ", formattedBS);
                return createBattingScores(formattedBS);
            })
            .then(function(createdBattingScores) {
                newInnings.battingScores = createdBattingScores;
                var formattedBS = formatBowlingScores(scoreInning.bowlingScores, newInnings.id, tourneyId);
                return createBowlingScores(formattedBS);
            })
            .then(function(createdBowlingScores) {
                newInnings.bowlingScores = createdBowlingScores;
                log.info('Created both innings and batting scores & bowling scores');
                defer.resolve(newInnings);
            })
            .catch(function() {
                log.error("Error creating Innings");
                defer.reject(new Error("Inning Create failed"));
            });
        return defer.promise;
    }

    function handleSubmit(scoreSheet, cb) {
        // First lets update match details
        updateMatchDetails(scoreSheet, false, function(err, m) {
            log.info("Now Saving Innings for Match:" + m.id + " tournament id : " + m.tournamentId);
            if (err || !m) {
                return cb(new Error("Error in Submitting Scoresheet", err));
            }
            // if there is no error, lets update both innings, serially
            splitAndStoreInning(scoreSheet.score.inningOne, m.tournamentId)
                .then(function(inn1) {
                    log.info("Created Inning 1: " + inn1.id);
                    m.inningOneId = inn1.id;
                    log.info(" Now creating Inning 2:" + scoreSheet.score.inningTwo);
                    return splitAndStoreInning(scoreSheet.score.inningTwo, m.tournamentId);
                })
                .then(function(inn2) {
                    log.info("Created Inning 2: " + inn2.id);
                    m.inningTwoId = inn2.id;

                    //if wer are here,  everything went smooth, lets change
                    // the status to submit and save the match.
                    changeMatchScoreSheetStatus(m, MATCH_SCORESHEET_STATUS.SUBMIT);
                    // return success;
                    scoreSheetSubmitted(m.id);
                    return m.save(cb);
                })
                .catch(function(err) {
                    if (err) {
                        log.error("Error in updateMatchDetails", err);
                    }
                    cb(err);
                });

        });
        return true;
    }

    /***
     * Observer for event 'after save' and handle two cases:
     * 1. submit: Populate scores, and delete saved version
     * 2. saved: update match.scoreSheetStatus and just update the score
     */

    ScoreSheet.observe('after save', function updateTimestamp(ctx, next) {
        log.info("ScoreSheet after Save:"); // + JSON.stringify(ctx.instance));
        var scoreSheet = ctx.instance;
        if (scoreSheet && scoreSheet.status === "submit") {
            log.info("ScoreSheet is Submitted");
            handleSubmit(scoreSheet, next);
        } else {
            log.info("ScoreSheet is : " + scoreSheet.status);
            handleSave(scoreSheet, next);
        }
    });
};