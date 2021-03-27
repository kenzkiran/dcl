/***
 * TourneyStatsAggregator class will collect and calculate
 * stats for a given tournament
 * @constructor
 */
var loopback = require('loopback');
var log = require('./logger.js')();
var _ = require('underscore');
var statsUtil = require('./stats-util.js');


/***
 * PlayerStats Class
 * @constructor
 */
function PlayerStats(player) {
    this.playerId = player.id;
    this.player = player;
    this.stats;
    this.battingScores;
    this.bowlingScores;
    this.bestBattingScore;
    this.bestBowlingScore;
    this._reset();
}

PlayerStats.prototype = {
    _reset: function() {
        this.stats = {};
        this.battingScores = [];
        this.bowlingScores = [];
        this.fieldingScores = [];
        this.bestBattingScore = undefined;
        this.bestBowlingScore = undefined;
    },
    addBattingScore: function(bs) {
        //log.debug("Adding Batting Score for player: ", this.player.firstName);
        this.battingScores.push(bs);
    },

    addBowlingScore: function(bs) {
        //log.debug("Adding Bowling Score for player: ", this.player.firstName);
        this.bowlingScores.push(bs);
    },

    addFieldingScore: function(fs) {
        this.fieldingScores.push(fs);
    },
    _calculateStats: function(scores, statsFunctor) {
        if (!_.isFunction(statsFunctor)) {
            console.error("Please provide a stats functor");
            return;
        }
        return statsFunctor(scores);
    },

    _getStats: function(whatStats) {
        whatStats = whatStats || 'both';
        var d =  _.clone(this.player);
        d.stats = {};
        d.stats.totalMatches = this.stats.batting.totalMatches;
        if (whatStats === 'bat' || whatStats === 'both') {
            d.stats.batting = _.clone(this.stats.batting);
            d.stats.fielding = _.clone(this.stats.fielding);
        }

        if (whatStats === 'bowl' || whatStats === 'both') {
            d.stats.bowling = _.clone(this.stats.bowling);
        }
        return d;
    },

    calculateStats: function() {
        log.debug("Now Calculating Player Stats: ", this.player.firstName, this.bowlingScores.length, this.battingScores.length);
        this.stats.bowling = this._calculateStats(this.bowlingScores, statsUtil.calculateBowlingStats);
        this.stats.batting = this._calculateStats(this.battingScores, statsUtil.calculateBattingStats);
        this.stats.fielding = this._calculateStats(this.fieldingScores, statsUtil.calculateFieldingStats);
        //this.dump();
    },
    dump: function() {
        log.info("Player: " + this.player.firstName + " " + this.player.lastName);
        log.info("Stats: ", this.stats);
    },
    dumpName: function() {
        log.info("Player: " + this.player.firstName + " " + this.player.lastName);
    },
    battingStats: function() {
        return this._getStats('bat');
    },

    bowlingStats: function() {
        return this._getStats('bowl');
    }
};

/****
 *
 * @param team
 * @constructor
 */
function TeamStat(team) {
    this.team = team;
    this.teamId = team.id;
    this._reset();
}

TeamStat.prototype = {
    _reset: function () {
        this.numMatches = 0;
        this.numPlayed = 0;
        this.playerStats = [];
        this.forRuns = 0;
        this.againstRuns = 0;
        this.forOvers = 0;
        this.againstOvers = 0;
        this.tossWins = 0;
        this.wins = 0;
        this.loss = 0;
        this.ties = 0;
        this.abandoned = 0;
    },

    findPlayerStatById: function(playerId) {
        var playerStat = undefined;
        var found = _.findIndex(this.playerStats, function(pb) {
            return pb.playerId.toString()  === playerId.toString();
        });

        if (found !== -1) {
            playerStat = this.playerStats[found];
        }
        return playerStat;
    },

    // always extract after extracting batting
    _addFieldingScore: function(bs) {
        if (!_.isObject(bs)) {
            return;
        }


        var playerStat = this.findPlayerStatById(bs.fielderId);
        if (!playerStat) {
            log.error("Not able to find the player with fielderId:" + bs.fielderId);
            // always add after batting stats;
            return;
        }
        playerStat.addFieldingScore(bs);
    },
    _addScore: function(isBatting, bs) {
        if (!_.isObject(bs)) {
            return;
        }
        var player;
        if (isBatting) {
            player = bs.batsman;
        } else {
            player = bs.bowler;
        }
        var playerStat = this.findPlayerStatById(player.id);

        if (!playerStat) {
            playerStat = new PlayerStats(player, {id: this.teamId, name: this.team.name});
            this.playerStats.push(playerStat);
        }

        if (isBatting) {
            playerStat.addBattingScore(bs);
        } else {
            playerStat.addBowlingScore(bs);
        }
    },

    _extractBowling: function(bowlingScores) {
        for(var b = 0; b < bowlingScores.length; ++b) {
            this._addScore(false, bowlingScores[b]);
        }
    },
    _extractBatting: function(battingScores) {
        for(var b = 0; b < battingScores.length; ++b) {
            this._addScore(true, battingScores[b]);
        }
    },

    _extractFielding: function(oppBattingScores) {
        for (var b = 0; b < oppBattingScores.length; ++b) {
            var bs = oppBattingScores[b];
            if (bs.status === 'caught' || bs.status === 'runout' || bs.status === 'stumped') {
                this._addFieldingScore(bs);
            }
        }
    },

    _extractMatchStatus : function(match) {
        if (match.tossWinnerId.toString() == this.teamId.toString()) {
            this.tossWins++;
        }
        log.info(match.teamOne.name + " vs " + match.teamTwo.name + " " + match.status);
        if (match.status == 'Won') {
           if (match.winTeamId.toString() == this.teamId.toString()) {this.wins++;}
           else {this.loss++;}
        } else if (match.status == 'Tie') {
            this.ties++
        } else {
            this.abandoned++;
        }
    },
    _extractTotals: function(match) {
        var battingInning;
        var bowlingInning;
        var fieldingInning;
        if (match.inningOne.battingTeamId.toString() == this.teamId.toString()) {
            battingInning = match.inningOne;
            bowlingInning = match.inningTwo;
        } else {
            battingInning = match.inningTwo;
            bowlingInning = match.inningOne;
        }
        // FIXME: Need to use revised total here
        this.forRuns += battingInning.totalRuns;
        this.forOvers += battingInning.totalOvers;
        this.againstRuns += bowlingInning.totalRuns;
        this.againstOvers += bowlingInning.totalOvers;

        // Now pass batting and bowling scores for this team
        this._extractBatting(battingInning.batting);
        this._extractBowling(bowlingInning.bowling);
        // since we need to extract fielding, we taking opposition batting scores
        this._extractFielding(bowlingInning.batting);
    },

    extractInfoFromMatch: function(match) {
        log.info("Extract Info from Match for Team: " + this.team.name);
        this.numMatches++;
        if (match.scoreSheetStatus !== 'submit') {
            return;
        }
        this.numPlayed++;
        // first extract wins/ties etc based on status
        this._extractMatchStatus(match);
        this._extractTotals(match);
    },

    battingStats: function() {
        var bss = [];
        _.forEach(this.playerStats, function(playerStat) {
            var bs = playerStat.battingStats();
            bs.teamName = this.team.name;
            bs.teamId = this.team.id;
            bss.push(bs);
        }.bind(this));
        return bss;
    },

    bowlingStats: function() {
        var bws = [];
        _.forEach(this.playerStats, function(playerStat) {
            var bs = playerStat.bowlingStats();
            bs.teamName = this.team.name;
            bs.teamId = this.team.id;
            bws.push(bs);
        }.bind(this));
        return bws;
    },

    calculateStats : function() {

        log.info("Calculating Team Stat:", this.team.name);
        var stats = _.pick(this, ['numPlayed', 'numMatches', 'forRuns', 'forOvers', 'againstRuns', 'againstOvers',
            'tossWins', 'wins', 'loss', 'ties', 'abandoned']);
        stats.teamName = this.team.name;
        stats.teamId = this.team.id;

        // calculate stats for each player
        _.forEach(this.playerStats, function(playerStat) {
            playerStat.calculateStats();
            playerStat.dump();
        });


        // Aggregate Batting Stats
        var playersBattingStats = [];
        _.forEach(this.playerStats, function(playerStat) {
            playersBattingStats.push(playerStat.battingStats(true));
        });

        // Aggregate Bowling Stats;
        var playersBowlingStats = [];
        _.forEach(this.playerStats, function(playerStat) {
            var pbs = playerStat.bowlingStats();
            // No need to push players who did not even bowl a ball
            if (pbs.stats.bowling.totalBalls != 0) {
                playersBowlingStats.push(playerStat.bowlingStats());
            }
        });

        // sort them
        stats.battingStats = playersBattingStats.sort(function(b1, b2) {
            return statsUtil.battingStatsComparator(b1.stats.batting, b2.stats.batting);
        });

        stats.bowlingStats = playersBowlingStats.sort(function(b1, b2) {
            return statsUtil.bowlingStatsComparator(b1.stats.bowling, b2.stats.bowling);
        });

        return stats;
    }
};

function TourneyStatsAggregator() {
    this.teamStats;
    this.matches;
    this.stats;
    this.reset();
}

TourneyStatsAggregator.prototype = {
    reset: function() {
        this.teamStats = [];
        this.matches = [];
        this.stats = {};
    },

    calculateStats: function() {
        this.stats.totalMatches = this.matches.length;
        this.stats.teams = [];
        this.stats.allBatting = [];
        this.stats.allBowling = [];
        var allBattingStats = [];
        var allBowlingStats = [];
        for(var t = 0; t < this.teamStats.length; ++t) {
            this.stats.teams.push(this.teamStats[t].calculateStats());
            allBattingStats = allBattingStats.concat(this.teamStats[t].battingStats());
            allBowlingStats = allBowlingStats.concat(this.teamStats[t].bowlingStats());
        }
        this.stats.summary = this._summary(allBattingStats, allBowlingStats);
        this.stats.topWicketTakers = this._topWicketTakers(allBowlingStats, 20);
        this.stats.topRunAggregate = this._topRunAggregrates(allBattingStats, 20);

        return this.stats;
    },

    _summary: function(allBattingStats, allBowlingStats) {

        var filteredBowlingStats = _.reject(allBowlingStats, function(pbs) {
            return pbs.stats.bowling.totalBalls === 0;
        });

        var topBattingScore;
        var topRunAverage;
        var topBowlingEconomy;
        var topBowlingAverage;
        var topWicketTaker;

        log.info("AllBattingStats: ", allBattingStats.length, filteredBowlingStats.length);
        for(var i = 0; i < allBattingStats.length; ++i) {
            var bs = allBattingStats[i];
            //log.info("Batting Stats: ", bs.stats.batting);
            if (i == 0) {
                topRunAverage = bs;
                topBattingScore = bs;
            } else {
                if (parseFloat(bs.stats.batting.average) > parseFloat(topRunAverage.stats.batting.average)) {
                    topRunAverage = bs;
                }

                //log.info("Comparing bs ", topBattingScore.stats.batting.topScore.runs, bs.stats.batting.topScore.runs);
                if (statsUtil.battingScoreComparator(topBattingScore.stats.batting.topScore, bs.stats.batting.topScore) == 1) {
                    topBattingScore = bs;
                }
            }
        }

        for(var i = 0; i < filteredBowlingStats.length; ++i) {
            var bs = filteredBowlingStats[i];
            var currentStats = bs.stats.bowling;
            if (i == 0) {
                topBowlingEconomy = bs;
                topBowlingAverage = bs;
                topWicketTaker = bs;
            } else {
                if (topBowlingEconomy.stats.bowling.economyRate == statsUtil.INDETERMINATE ||
                        topBowlingEconomy.stats.bowling.economyRate > currentStats.economyRate) {
                    topBowlingEconomy = bs;
                }
                //console.log("Change Bowling Average cur: " + currentStats.average + " top: " + topBowlingAverage.stats.bowling.average);
                if (topBowlingAverage.stats.bowling.average == statsUtil.INDETERMINATE) {
                    topBowlingAverage = bs;
                } else if (currentStats.average != statsUtil.INDETERMINATE &&
                        topBowlingAverage.stats.bowling.average > currentStats.average) {
                        topBowlingAverage = bs;
                }
                if (statsUtil.bowlingStatsComparator(topWicketTaker.stats.bowling, currentStats) == 1) {
                    topWicketTaker = bs;
                }
            }
        }
        return {
            topBowlingEconomy: topBowlingEconomy,
            topBowlingAverage: topBowlingAverage,
            topRunAverage: topRunAverage,
            topBattingScore: topBattingScore
        }

    },

    // NOTE: Don't call this function before calling calculateStats for each playerStats
    _topRunAggregrates: function(playerBattingStats, restrict) {
        var sorted = playerBattingStats.sort(function(b1, b2) {
            return statsUtil.battingStatsComparator(b1.stats.batting, b2.stats.batting);
        });
        return sorted.splice(0, restrict);
    },

    _topWicketTakers: function(playerBowlingStats, restrict) {
        var filtered = _.reject(playerBowlingStats, function(pbs) {
            return pbs.stats.bowling.totalBalls === 0;
        });
        var sorted = filtered.sort(function(b1, b2) {
            return statsUtil.bowlingStatsComparator(b1.stats.bowling, b2.stats.bowling);
        });
        return sorted.splice(0, restrict);
    },

    createOrFindTeamStat: function(team) {
        var teamStat = this.findTeamStatById(team.id);

        if (!teamStat) {
            log.debug("Add new team stat for :", team.name);
            teamStat = new TeamStat(team);
            this.teamStats.push(teamStat);
        }
        return teamStat;
    },

    findTeamStatById: function(id) {
        var teamStat = undefined;
        var found = _.findIndex(this.teamStats, function(ts) {
            return ts.teamId.toString()  === id.toString();
        });

        if (found !== -1) {
            teamStat = this.teamStats[found];
        }
        return teamStat;
    },

    addMatch: function(match) {
        this.matches.push(match);
        var teams = [];
        teams[0] = match.teamOne;
        teams[1] = match.teamTwo;
        for (var t = 0; t < teams.length; ++t) {
            var teamStat = this.createOrFindTeamStat(teams[t]);
            teamStat.extractInfoFromMatch(match);
        }
    }
};

module.exports = TourneyStatsAggregator;