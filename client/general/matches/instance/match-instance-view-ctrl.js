'use strict';

var MATCH_STATUS = {
    INIT: "init",
    ERROR: "error",
    SUCCESS: "success"
};

module.exports = function ($log, $rootScope, $scope, $timeout, $stateParams, $filter, $q, Match, ScoreSheet) { //jshint unused:false
    $scope.id = $stateParams.id;
    $scope.teams = [];
    $scope.match = undefined;
    $scope.status = MATCH_STATUS.INIT;
    $scope.formattedInningOne = {};
    $scope.formattedInningTwo = {};
    $scope.winningTeam = {};
    $scope.firstBattingStyle = "runner";
    $scope.secondBattingStyle = "runner";
    $scope.headerWinLossTitle = "Winner";

    var _teamOne;
    var _teamTwo;
    var _firstBattingTeam;
    var _secondBattingTeam;
    var _inningOne;
    var _inningTwo;

    $scope.inningsRunRate = function(order) {
        var inn = (order === 1) ?  _inningOne: _inningTwo;
        return inn.runRate.toFixed(2);
        /*
        var overs = getInningOversInternal(inn);
        overs = parseFloat(overs.overs + overs.balls/6.0).toFixed(2);
        $log.info("Run Rate Runs/overs", inn.total, overs);
        return (inn.total/overs).toFixed(2);
        */
    };

    $scope.firstBattingTeamName = function() {
        return _firstBattingTeam.name;
    };

    $scope.secondBattingTeamName = function() {
        return _secondBattingTeam.name;
    };

    $scope.firstBattingScore = function() {
        return '' + _inningOne.totalRuns + '/' + getInningWickets(_inningOne);
    };

    $scope.secondBattingScore = function() {
        return '' + _inningTwo.totalRuns + '/' + getInningWickets(_inningTwo);
    };

    $scope.firstInningOvers = function() {
        return getInningOvers(_inningOne);
    };

    $scope.secondInningOvers = function() {
        return getInningOvers(_inningTwo);
    };

    $scope.getMaxOvers = function(order) {
        var inn = (order === 1) ?  _inningOne: _inningTwo;
        return parseFloat(inn.maxOvers).toFixed(1);
    };

    /***
     * This function formats an innings to prepare structures
     * easy to be displayed
     * @param order {1/2} Inning order 1st or 2nd
     * @returns {Object} visually helpful formatted inning
     */
    function formatInning(order) {
        var formatted = {};
        var inning = {};
        order = parseInt(order);
        $log.info('Formatting for order:', order);

         if (order === 1 || order === 2) {
            inning = (order === 1) ? _inningOne : _inningTwo;
         } else {
             return formatted;
         }

        formatted = _.omit(inning, 'battingScores');
        formatted.order = order;
        formatted.battingScores = getInningBattingScores(inning);
        if (inning.battingTeamId === _firstBattingTeam.id) {
            formatted.battingTeam = _firstBattingTeam;
            formatted.bowlingTeam = _secondBattingTeam;
        }  else {
            formatted.bowlingTeam = _firstBattingTeam;
            formatted.battingTeam = _secondBattingTeam;
        }

        formatted.overAndrr = {wickets: getInningWickets(inning), rr: $scope.inningsRunRate(order)};
        console.log("Ravi formatted: ", formatted);
        return formatted;
    }

    function getInningBattingScores(inning) {
        var bs = inning.battingScores;
        var dnb = [];
        var played = [];

        for (var i = 0; i < bs.length; ++i) {
            var batsman = bs[i];
             if (batsman.status === 'DNB') {
                 dnb.push(angular.copy(batsman));
             } else {
                 played.push(angular.copy(batsman));
             }
        }

        return { dnb: dnb, played: played };
    }

    function getInningOversInternal(inning) {
        var bs = inning.bowlingScores;
        var totalOvers = 0;
        var totalBalls = 0;
        for (var i = 0; i < bs.length; ++i) {
            totalOvers += bs[i].overs;
            totalBalls += bs[i].balls;
        }

        if (totalBalls > 5) {
            totalOvers += parseInt(totalBalls/6);
            totalBalls = totalBalls % 6;
        }
        return { overs: totalOvers, balls: totalBalls};
    }

    function getInningOvers(inning) {
        var overs = getInningOversInternal(inning);
        return overs.overs + '.' + overs.balls;
    }



    function getInningWickets(inning) {
        var bs = inning.battingScores;
        var wickets = 0;
        for (var i = 0; i < bs.length; ++i) {
            //status: ['DNB', 'caught', 'bowled', 'stumped', 'runout', 'hitwk', 'lbw', 'retired hurt', 'retired out', 'handled ball', 'obstruct field', 'timed out', 'double hit', 'NotOut']
            if (!(bs[i].status === 'NotOut' || bs[i].status === 'DNB' || bs[i].status === 'retired hurt')) {
                wickets++;
            }
        }

        if (inning.wickets && wickets < inning.wickets) {
            wickets = inning.wickets;
        }

        return wickets;
    }

    /***
     * Helper function to extract match details into a more consumable form
     * @param match
     */
    function extractMatchDetails(match) {
        _teamOne = match.teamOne;
        _teamTwo = match.teamTwo;
        $scope.teams.push(angular.copy(match.teamOne));
        $scope.teams.push(angular.copy(match.teamTwo));
        if (match.inningOne.battingTeamId === _teamOne.id) {
            _firstBattingTeam = _teamOne;
            _secondBattingTeam = _teamTwo;
        } else {
            _firstBattingTeam = _teamTwo;
            _secondBattingTeam = _teamOne;
        }
        _inningOne = match.inningOne;
        _inningTwo = match.inningTwo;

        // format innings so view can consume
        $scope.formattedInningOne = formatInning(1);
        $scope.formattedInningTwo = formatInning(2);

        // pick the winning team
        if ($scope.match.status === "Won") {
            $scope.winningTeam = _.where($scope.teams, {id: match.winTeamId})[0];
            if ($scope.winningTeam.id === _firstBattingTeam.id) {
                $scope.firstBattingStyle = "winner";
            } else {
                $scope.secondBattingStyle = "winner";
            }
            $scope.headerWinLossTitle = "Winner: " +  $scope.winningTeam.name + ' : ' + match.result;
        } else {
            // Tie or Abandoned
            $scope.headerWinLossTitle = $scope.match.status + ' : ' + match.result;
        }

        console.log("WinningTeam:  " + JSON.stringify($scope.winningTeam));
        $scope.status = "success";
    }

    function setStatus(status, statusString) {
        $scope.status = status;
        if (statusString) {
            $scope.statusString = statusString;
        }
    }
    function init() {
        $scope.teams = [];
        var matchId = $scope.id;
        Match.getMatch(matchId).then(function(res) {
           $scope.match = res;
            $log.info("Got Match: " + $scope.match.scoreSheetStatus);
           if ($scope.match) {
               if ($scope.match.scoreSheetStatus !== "submit") {
                   var statusString = "Scoresheet Not Available for Match";
                   setStatus(MATCH_STATUS.ERROR, statusString);
               } else {
                   $log.info("Now retrieving Match");
                   Match.getScoreSheet(matchId).then(function (res) {
                       $scope.match = res;
                       $log.info("Match ScoreSheet retrieved:", res);
                       extractMatchDetails($scope.match);
                   }).catch(function (err) {
                       $log.info("Match ScoreSheet retrieval error", err);
                       var statusString = "ScoreSheet Retrieval Error for Match:";
                       setStatus(MATCH_STATUS.ERROR, statusString);
                   });
               }
           }
        }).catch(function(err) { //jshint unused: false
            $scope.match = undefined;
            setStatus(MATCH_STATUS.ERROR, "Match Not Found");
        });

    }
    /* Initial code execution begin here */
    init();

};