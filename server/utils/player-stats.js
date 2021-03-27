/***
 * PlayerStatsAggregator class will collect and calculate
 * stats for a given player
 * @constructor
 */
var loopback = require('loopback');
var log = require('./logger.js')();
var _ = require('underscore');
var statsUtil = require('./stats-util.js');


/**
 * This is a class the aggregates Player's scores for various types
 * There will one instance of this object for types: 'Tape', 'Leather', 'Tennis'
 *
 * @param type string 'Tape'/'Leather'/'Tennis' or anything else
 * @param which string 'Bat/Bowl'
 * @constructor
 */

var BAT = 'Bat';
var BOWL = 'Bowl';

function ScoresByType(type) {
    this.type = type;
    this.batScores = [];
    this.bowlScores = [];
    this.stat = {}
}

ScoresByType.prototype = {
  addBattingScore: function(bs) {
      this.batScores.push(bs);
  },
  addBowlingScore: function(bs) {
      this.bowlScores.push(bs);
  },
  calculateStats: function() {
      this.stat.batting = statsUtil.calculateBattingStats(this.batScores);
      this.stat.bowling = statsUtil.calculateBowlingStats(this.bowlScores);
      // append type to stat;
      this.stat.type = this.type;
      return this.stat;
  }
};

function PlayerStatsAggregator() {
    this.battingScores;
    this.bowlingScores;
    this.stats;
    this.scoresByType;
    this.reset();
}

PlayerStatsAggregator.prototype = {
    reset: function() {
        this.battingScores = [];
        this.bowlingScores = [];
        this.scoresByType = [];
        this.stats = [];
    },

    _addScoreByType: function(allTypes, which, score, type) {
        if (!score) {
            log.error("Error: score is not valid");
            return;
        }
        if(!_.isArray(allTypes)) {
            log.error("Error allTypes needs to be an Array");
            return;
        }
        if (!type) {
            log.info('We are assuming the score is of type: Tape');
            type = 'Tape';
        }

        var scoresByType = undefined;
        var found = _.findIndex(allTypes, function(bsByType) {
            return bsByType.type === type;
        });

        // if we don't find it, create one for type
        if (found === -1) {
            log.info("Creating ScoresByType: ", type, which);
            scoresByType = new ScoresByType(type);
            allTypes.push(scoresByType);
        } else {
            scoresByType = allTypes[found];
        }

        if (which == BAT) {
            scoresByType.addBattingScore(score);
        } else {
            scoresByType.addBowlingScore(score);
        }
    },
    addBowlingScore: function(bs, type) {
        log.info("AddBowlingScore", bs);
        type = type || 'Tape'; // we default to tape
        if (!bs) {
            return;
        }
        this.bowlingScores.push(bs);
        this._addScoreByType(this.scoresByType, BOWL, bs, type);
    },

    addBattingScore: function(bs, type) {
        type = type || 'Tape'; // we default to tape
        if (!bs) {
            return;
        }
        this.battingScores.push(bs);
        this._addScoreByType(this.scoresByType, BAT, bs, type);
    },

    calculateStats: function() {
        this.stats = [];
        for (var i = 0; i < this.scoresByType.length; ++i) {
            var bsScoreByType = this.scoresByType[i];
            this.stats.push(bsScoreByType.calculateStats());
        }

        return {data: this.stats};
    }
};

module.exports = PlayerStatsAggregator;

