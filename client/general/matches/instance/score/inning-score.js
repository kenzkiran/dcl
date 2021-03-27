/**
 * Created by rramachandra on 2016-07-07.
 */
var BowlingScore = require('./bowling-score.js');
var BattingScore = require('./batting-score.js');
var ScoreUtils = require('./score-utils');

var idToPlayer = ScoreUtils.idToPlayer;

module.exports = ['$rootScope', '$log', 'DclCommon', function ($rootScope, $log, DclCommon) {

  // These values are to be kept seperate because we put a watch on the whole innings variable
  // Keeping the variable in innings will cause infinite recursion calls
  // There will be 2 sets of Derived Values for each innings

  // Need to restructure this Extras class
  function Extras(lb, b) {
    this.legbyes = lb || 0;
    this.byes = b || 0;
  }

  function ScoreTotals(t, tw, tn, tr, et) {
    this.total = t || 0;
    this.totalWides = tw || 0;
    this.totalNoballs = tn || 0;
    this.totalRuns = tr || 0;
    this.extrasTotal = et || 0;
  }

  function InningScore(order, battingTeam, bowlingTeam, savedInning) {
    this.reset();
    this.order = order;
    this.battingTeam = battingTeam;
    this.bowlingTeam = bowlingTeam;
    this.batsmen = angular.copy(battingTeam.players);
    this.bowlers = angular.copy(bowlingTeam.players);
    this.id = savedInning.id || undefined;
    if (savedInning) {
      this.previouslySaved = true;
      this.dataSource = savedInning;
    }
    $log.info('Ravi InningScore Created for order:', this.order);
    this.loadInnings(this.dataSource);
  }

  InningScore.prototype = {
    reset: function () {
      this.totalOvers = 0.0;
      this.runRate = 0.0;
      this.id = undefined;
      this.battingPanel = true;
      this.bowlingPanel = true;
      this.extrasPanel = true;
      this.numPlayers = 11;
      this.minNumReqdPlayers = DclCommon.MinRequiredPlayers;
      this.order = undefined;
      this.scoreTotals = new ScoreTotals();
      this.battingTeam = undefined;
      this.bowlingTeam = undefined;
      this.batsmen = [];
      this.bowlers = [];
      this.batsmanStatus = DclCommon.batsmanStatus;
      this.battingScores = [];
      this.bowlingScores = [];
      this.extras = {};
      this.notes = '';
      this.maxOvers = DclCommon.T20MaxOvers;
      this.revisedTotal = 0;
    },
    getMaxOvers: function () {
      return this.maxOvers;
    },
    getTotal: function () {
      return this.scoreTotals.total;
    },
    loadInnings: function (savedInning) {
      $log.info('Ravi: Now loading Innings');
      savedInning = savedInning || {};
      this.numPlayers = savedInning.numPlayers || 11;
      this.numPlayers = Math.min(this.numPlayers, 11);
      this.notes = savedInning.notes || '';
      this.extras = new Extras(savedInning.legbyes || 0, savedInning.byes || 0);
      this.maxOvers = savedInning.maxOvers || DclCommon.T20MaxOvers;

      // extract batting && bowling scores
      this._extractBattingScores(savedInning.battingScores);
      this._extractBowlingScores(savedInning.bowlingScores);
    },
    _extractBowlingScores: function (savedBowlingScores) {
      savedBowlingScores = savedBowlingScores || [];
      if (savedBowlingScores.length) {
        for (var i = 0; i < savedBowlingScores.length; ++i) {
          var bws = new BowlingScore(savedBowlingScores[i]);
          this.bowlingScores.push(bws);
          if (!(bws.bowler && bws.bowler.id)) {
            bws.bowler = idToPlayer(bws.bowlerId, this.bowlers);
          }
        }
      }

      // we have to have a min of 5 bowlers
      var remaining = 5 - savedBowlingScores.length;
      if (remaining > 0) {
        while (remaining > 0) {
          this.bowlingScores.push(new BowlingScore());
          --remaining;
        }
      }
    },
    _extractBattingScores: function (savedBattingScores) {
      savedBattingScores = savedBattingScores || [];
      if (savedBattingScores.length) {
        for (var i = 0; i < savedBattingScores.length; ++i) {
          var bs = new BattingScore(savedBattingScores[i]);
          this.battingScores.push(bs);
          //
          if (!(bs.batsman && bs.batsman.id)) {
            bs.batsman = idToPlayer(bs.batsmanId, this.batsmen);
          }
          if (!(bs.fielder && bs.fielder.id)) {
            bs.fielder = idToPlayer(bs.fielderId, this.bowlers);
          }
          if (!(bs.bowler && bs.bowler.id)) {
            bs.bowler = idToPlayer(bs.bowlerId, this.bowlers);
          }
        }
      }

      var remaining = this.numPlayers - this.battingScores.length;
      if (remaining > 0) {
        while (remaining > 0) {
          this.battingScores.push(new BattingScore());
          --remaining;
        }
      }
    },
    /** BEGIN INTERNAL Methods **/
    _incBowlerWicket: function (bowler) {
      var i = 0;
      //$log.debug('incBowlerWicket: ' + JSON.stringify(bowler));
      var bs = this.bowlingScores;
      for (i = 0; i < bs.length; ++i) {
        if (bs[i].bowler && bs[i].bowler.id === bowler.id) {
          bs[i].wickets += 1;
          return;
        }
      }

      $log.debug("Finding empty spot for bowler");
      i = 0;
      // if we are here, we could not the bowler or bowler not set.
      for (; i < bs.length; ++i) {
        if (bs[i].bowler && bs[i].bowler.name !== '') {
          continue;
        } else {
          break;
        }
      }
      var bowlingScore;
      if (i < bs.length) {
        $log.debug("Updating bowler at: " + i);
        bowlingScore = bs[i];
      } else {
        $log.debug("Creating new bowler at");
        bowlingScore = new BowlingScore();
        bs.push(bowlingScore);
      }
      bowlingScore.bowler = bowler;
      bowlingScore.wickets = 1;
    },
    _calculateBowlerWickets: function () {
      var ii = 0;
      var bs = this.bowlingScores;
      var bts = this.battingScores;

      //reset it
      for (ii = 0; ii < bs.length; ++ii) {
        bs[ii].wickets = 0;
      }

      for (ii = 0; ii < bts.length; ++ii) {
        var bowler = bts[ii].bowler;
        if (bowler.id) {
          this._incBowlerWicket(bowler);
        }
      }
    },
    calculateTotal: function () {
      var inning = this;
      // reset them to zero
      $log.debug('Recalculating Scores');
      var scoreTotals = inning.scoreTotals;
      scoreTotals.extrasTotal = 0;
      scoreTotals.totalWides = 0;
      scoreTotals.totalRuns = 0;
      scoreTotals.totalNoballs = 0;
      scoreTotals.Total = 0;

      // Add bowlers extras
      for (var i = 0; i < inning.bowlingScores.length; ++i) {
        scoreTotals.totalWides += inning.bowlingScores[i].wides;
        scoreTotals.totalNoballs += inning.bowlingScores[i].noballs;

      }
      //Add byes and legbyes to bowler wides and noballs
      scoreTotals.extrasTotal = scoreTotals.totalNoballs + scoreTotals.totalWides + inning.extras.byes + inning.extras.legbyes;
      $log.debug('scoreTotal: extras: ' + scoreTotals.extrasTotal);

      var totalRuns = 0;
      for (var i = 0; i < inning.battingScores.length; ++i) {
        totalRuns += inning.battingScores[i].runs;
      }
      scoreTotals.totalRuns = totalRuns;
      //$log.debug('scoreTotal: batting: ' + scoreTotals.totalRuns);
      scoreTotals.total = scoreTotals.totalRuns + scoreTotals.extrasTotal;
      inning.revisedTotal = scoreTotals.total;
      this._updateRunRate();
      $log.debug('scoreTotals: total' + scoreTotals.total);
    },
    _updateRunRate: function () {
      var overs = this.getOversBowled();
      this.totalOvers = parseFloat(overs.overs + overs.balls / 6.0).toFixed(2);
      this.runRate = this.getRunRate();
    },
    /** BEGIN EXTERNAL Methods **/
    flatten: function () {
      var acopy = {};
      var k = ['order', 'notes', 'revisedTotal', 'maxOvers', 'numPlayers'];
      for (var i = 0; i < k.length; ++i) {
        acopy[k[i]] = angular.copy(this[k[i]]);
      }
      /* make sure we re-calculate totals */
      this.calculateTotal();
      acopy.battingScores = [];
      for (var i = 0; i < this.battingScores.length; ++i) {
        var batScore = this.battingScores[i].flatten(true);
        // push only if scores have valid batsman
        if (batScore) {
          acopy.battingScores.push(batScore);
        }
      }

      acopy.bowlingScores = [];
      for (var i = 0; i < this.bowlingScores.length; ++i) {
        var bowlScore = this.bowlingScores[i].flatten(true);
        if (bowlScore) {
          acopy.bowlingScores.push(bowlScore);
        }
      }
      acopy.battingTeamId = this.battingTeam.id;
      acopy.bowlingTeamId = this.bowlingTeam.id;
      acopy.id = this.id;
      acopy.byes = this.extras.byes;
      acopy.legbyes = this.extras.legbyes;
      acopy.totalRuns = this.scoreTotals.total;
      acopy.totalOvers = this.totalOvers;
      acopy.runRate = this.runRate;
      return acopy;
    },

    bowlerChange: function () {
      $log.debug('Inning: ' + this.order + '  bowlerChange');
      //$rootScope.$broadcast('match:resetVerify', {});
      this._calculateBowlerWickets(this);
    },

    runsChange: function () {
      $log.debug('Inning: ' + this.order + '  runsChange');
      this.calculateTotal(this);
    },

    bowlerExtrasChange: function () {
      $log.debug('Inning: ' + this.order + '  bowlerExtrasChange');
      this.calculateTotal();
    },
    bowlerOversChange: function () {
      $log.debug('Inning: ' + this.order + '  bowlerOversChange');
      this.calculateTotal();
    },
    extrasChange: function () {
      $log.debug('Inning: ' + this.order + '  extrasChange');
      this.calculateTotal(this);
    },

    numPlayersChange: function () {
      var diff = this.numPlayers - this.battingScores.length;
      $log.debug('Inning: ' + this.order + '  numPlayersChange: ' + diff);
      if (diff === 0) {
        return;
      }
      if (diff > 0) {
        for (var i = 0; i < diff; ++i) {
          this.battingScores.push(new BattingScore());
        }
      } else {
        diff = diff * -1;
        for (var i = 0; i < diff; ++i) {
          this.battingScores.pop();
        }
      }
      $rootScope.$broadcast('match:resetVerify', {});
    },
    addBowler: function () {
      if (this && this.bowlingScores.length < 11) {
        this.bowlingScores.push(new BowlingScore());
      }
    },
    /***
     * Return total overs and balls bowled in the innings
     * @returns {{overs: number, balls: number}}
     */
    getOversBowled: function () {
      var bs = this.bowlingScores;
      var totalOvers = 0;
      var totalBalls = 0;
      for (var i = 0; i < bs.length; ++i) {
        totalOvers += bs[i].overs;
        totalBalls += bs[i].balls;
      }

      if (totalBalls > 5) {
        totalOvers += parseInt(totalBalls / 6);
        totalBalls = totalBalls % 6;
      }
      return { overs: totalOvers, balls: totalBalls };
    },
    /***
     * Gets Current Innings run rate
     * @returns {float}
     */
    getRunRate: function () {
      var overs = this.getOversBowled();
      overs = parseFloat(overs.overs + overs.balls / 6.0).toFixed(2);
      var total = this.getTotal();
      $log.info("Run Rate Runs/overs", total, overs);
      return (total / overs).toFixed(2);
    },
    /***
     * SetFinalRunRate is calculate after a Winner is determine
     *  NOTE: THIS HAS TO BE CALLED JUST BEFORE SUBMIT
     */
    setFinalRunRate: function (rr) {
      this.runRate = rr;
    },
    getAvailableBatsman: function (index) {
      index = parseInt(index);
      var playersCopy = angular.copy(this.battingTeam.players);

      for (var i = 0; i < this.battingScores.length; ++i) {
        var bs = this.battingScores[i];

        var reducedPlayersCopy = _.reject(playersCopy, function (pc) {
          if (!bs || !bs.batsman || index === i) {
            return false;
          }
          return (pc.id === bs.batsman.id);

        });
        playersCopy = reducedPlayersCopy;
      }

      return playersCopy;
    }
  };

  return {
    'InningScore': InningScore,
    'Extras': Extras,
    'ScoreTotals': ScoreTotals
  };
}];