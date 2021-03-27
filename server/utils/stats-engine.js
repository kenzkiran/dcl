/**
 * Created by kenzkiran on 1/15/17.
 */

var loopback = require('loopback');
var log = require('./logger.js')();
var _ = require('underscore');
var TourneyStatsAggregator = require('./tourney-stats.js');
var PlayerStatsAggregator = require('./player-stats.js');
var statsUtil = require('./stats-util.js');


var tournamentStats = function(matches) {
    var statsAggregator = new TourneyStatsAggregator() ;
    for(var i = 0; i < matches.length; ++i) {
        var m = matches[i];
        var match = m.toJSON();
        // aggregate them into tourney stats
        statsAggregator.addMatch(match);
    }
    return statsAggregator.calculateStats();
};

var playerStats = function(playerId, cb) {
    var Player = loopback.getModel('Player');
    var playerStatsAgg = new PlayerStatsAggregator() ;
    var scoreFilter = {include: {
        relation: 'tournament',
        scope: {fields: ['gameType']}
    }};

    Player.findById(playerId, function(err, p) {
        if (p && !err) {
            /*  Note: Have to clone scoreFilter, else the function
             *  is modifying the filter and can't be used to query
             *  p.bowling.
             */
            p.batting(_.clone(scoreFilter), function(err, bs) {

                if (err) {
                    log.error("Error: Retrieving Batting Score for player id:", playerId);
                } else {
                    for (var i = 0; i < bs.length; ++i) {
                        var theBattingScore = bs[i].toJSON();
                        playerStatsAgg.addBattingScore(theBattingScore, theBattingScore.tournament.gameType);
                    }
                }
                p.bowling(_.clone(scoreFilter), function(err, bwls) {
                    // calculate bowling stats
                    if (err) {
                        log.error("Error: Retrieving Bowling Score for player id:", playerId);
                    } else {

                        for (var i = 0; i < bwls.length; ++i) {
                            var theBowlingScore = bwls[i].toJSON();
                            playerStatsAgg.addBowlingScore(theBowlingScore, theBowlingScore.tournament.gameType);
                        }
                    }
                    return cb(null, playerStatsAgg.calculateStats());
                });
            });
        } else {
            cb(err);
        }
    });
};

module.exports = {
    playerStats: playerStats,
    tournamentStats: tournamentStats
};

