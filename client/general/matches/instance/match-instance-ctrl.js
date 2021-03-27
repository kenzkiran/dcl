'use strict';

var ScoreUtils = require('./score/score-utils');
var concatPlayerName = ScoreUtils.concatPlayerName;

var MATCH_STATUS = {
    INIT: "init",
    ERROR: "error",
    SUCCESS: "success"
};

module.exports = function ($log, $rootScope, $scope, $timeout, $state, $stateParams, $filter, $q, Match, Tournament, Team, ScoreSheet, DclCommon, InningScore, MatchScore, ScoreVerifier, ModalService) {
    var InningScore = InningScore.InningScore;
    var MatchScore = MatchScore.MatchScore;
    $scope.matchScore = undefined;
    $scope.status = MATCH_STATUS.INIT;
    $scope.statusString = "Loading..";
    $scope.id = $stateParams.id;
    $scope.teams = [];
    $scope.issues = [];
    $scope.tossChoices = DclCommon.tossChoices;
    $scope.innings = [];
    $scope.match = {};
    $scope.BattingStatus = DclCommon.status;
    $scope.matchScoreSheet = {};
    $scope.lastSavedDate = '';
    $scope.showVerify = true;
    $scope.hasRunVerifyOnce = false;
    $scope.matchIsLock = false;
    $scope.matchIsSubmitted = false;
    $scope.showSaveButton = true;
    $scope.scoreInfoMessage = '';

    /* toss choice related */
    $scope.tossWinner = '';
    $scope.tossChoice = '';
    var loadSavedScoreSheet = false;
    $scope.match.tossWinner = $scope.tossWinner;
    $scope.match.tossChoice = $scope.tossChoice;
    $scope.inningsConfigured = false;

    /**
     * Set status of Match Retrieval
     * @param status
     * @param statusString
     */
    function setStatus(status, statusString) {
        $scope.status = status;
        if (statusString) {
            $scope.statusString = statusString;
        }
    }
    /***
     * Gets Team details and for the two teams
     * @param teamOneId {id} team one id
     * @param teamTwoId {id} team two id
     * @returns {*}
     */
    function getTeams(teamOneId, teamTwoId) {
        $scope.teams = [];
        var deferred = $q.defer();
        var t1Promise = Team.getTeamAndPlayers(teamOneId);
        var t2Promise = Team.getTeamAndPlayers(teamTwoId);
        $q.all([t1Promise, t2Promise]).then(function (res) {
            var t1 = res[0];
            var t2 = res[1];
            console.log('Received Team 1: ' + t1.id + ' Name: ' + t1.name);
            console.log('Received Team 2: ' + t2.id + ' Name: ' + t2.name);
            // Assuming we get both the teams
            $scope.teams.push(t1);
            $scope.teams.push(t2);

            // concat first and last name of players
            concatPlayerName(t1.players);
            t1.players.push({name: ''}); // add a dummy player for dropdown

            concatPlayerName(t2.players);
            t2.players.push({name: ''}); //add a dummy player for dropdown

            deferred.resolve(res);
        });
        return deferred.promise;
    }

    function confirmWithUser() {
        var savedDate = $filter('date')($scope.matchScoreSheet.saved, 'medium');
        var msg = 'Saved Scoresheet on : ' + savedDate + '. Load it ? (A \'No\' will loose all previously saved data)';

        function yes() {
            $log.info('Loading Saved Scoresheet');
            loadSavedScoreSheet = true;
            loadSaved();
        }

        function no() {
            $log.info('Loading New Scoresheet');
            loadSavedScoreSheet = false;
            setupWatches();
        }
        ModalService.confirmModal(msg, yes, no);
    }

    /**
     *
     * @param tossWinner
     * @param tossChoice
     * @param hasSavedDraft
     */
    function configureInnings(tossWinner, tossChoice, hasSavedDraft) {
        hasSavedDraft = hasSavedDraft || false;
        $scope.inningsConfigured = false;
        $scope.matchScore = new MatchScore($scope.match, $scope.teams, $scope.matchScoreSheet);
        if (hasSavedDraft) {
            $scope.tossWinner = $scope.matchScore.getTossWinner();
            $scope.tossChoice = $scope.matchScore.tossChoice;
        } else {
            $scope.matchScore.setTossWinner(tossWinner.id, tossChoice);
        }
        $scope.innings = $scope.matchScore.innings;
        //configureMatchResults(hasSavedDraft);
        $scope.inningsConfigured = true;
    }

    function tossChoiceChanged() {
        $scope.inningsConfigured = false;
        // As soon as we configure watches, after loading previously saved match, it triggers
        // a change, which we need to ignore.
        if (!$scope.tossWinner || !$scope.tossChoice) {
            console.log('Toss winner/choice not set, nothing to do');
            return;
        }
        console.log('Toss won by:' + $scope.tossWinner.name + ' and elected to ' + $scope.tossChoice + '!');
        configureInnings($scope.tossWinner, $scope.tossChoice, false);
    }


    $scope.addBowler = function (inningId) {
        inningId = parseInt(inningId);
        var inning = $scope.innings[inningId - 1];
        inning.addBowler();
    };

    function flattenMatchScoreSheet(calculateRunRate) {
        calculateRunRate = calculateRunRate || false;
        var scoreSheet = $scope.matchScoreSheet;
        var match = $scope.match;
        var matchScore = $scope.matchScore;
        scoreSheet.matchId = match.id;
        var score = scoreSheet.score = {};
        score.tossWinnerId = $scope.tossWinner && $scope.tossWinner.id;
        score.tossChoice = $scope.tossChoice;
        score.status = matchScore.status;
        score.winTeamId = matchScore.winTeamId;
        score.result = matchScore.result;
        score.momDesc = matchScore.momDesc;
        score.momId = matchScore.momId;

        score.inningOne = $scope.innings[0].flatten();
        score.inningTwo = $scope.innings[1].flatten();

        /*
         * RunRate is calculated as follows:
         *  if (inning1) then inning1 total Runs/ inning1 Max overs
         *  if (inning2) then inning2 total Runs/ (isWinner ? inning2 totalOvers : inning2 Max overs
         *  if it is a tie, then both innings run rate are calculated totalRuns/MaxOvers
         */

        if (calculateRunRate) {
            var firstInningRunRate = parseFloat($scope.innings[0].getTotal() / $scope.innings[0].getMaxOvers()).toFixed(2);
            var secondInningOvers = $scope.innings[1].getMaxOvers();
            if (score.winTeamId === $scope.innings[1].battingTeamId) {
                secondInningOvers = $scope.innings[0].getOversBowled();
            }
            var secondInningRunRate = parseFloat($scope.innings[1].getTotal() / secondInningOvers).toFixed(2);
            score.inningOne.runRate = firstInningRunRate;
            score.inningTwo.runRate = secondInningRunRate;
            console.log("Final RunRates: 1st Innings: " + firstInningRunRate + "  Second Innings: " + secondInningRunRate);
        }

        $log.info("Flattened: ", score);
        return scoreSheet;
    }

    function loadSubmitted() {
        $log.info('Loading Submitted Match');
        $scope.scoreInfoMessage = 'Scoresheet Submitted, Verify & Submit Again to Make Amends';
        configureInnings(null, null, true);
        setupWatches();
    }

    function loadSaved() {
        var savedDate = $filter('date')($scope.matchScoreSheet.saved, 'medium');
        $scope.scoreInfoMessage = 'Last Saved On: ' +  savedDate;
        configureInnings($scope.tossWinner, $scope.tossChoice, true);
        setupWatches();
    }


    function setupWatches() {
        $log.info("Setting up Watches");
        /* Watch for any changes in tossChoice, because the innings batting and bowling drop downs depends on the tossChoice */
        $scope.$watch('tossChoice', function (newVal, oldVal) {
            $log.info(' tossChoices has changed: ' + $scope.tossChoice);
            if (newVal !== oldVal) {
                tossChoiceChanged();
            }
        });
        $scope.$watch('tossWinner', function (newVal, oldVal) {
            $log.info(' tossWinner has changed: ' + $scope.tossWinner.name);
            if (newVal !== oldVal) {
                tossChoiceChanged();
            }
        });

        // Listen to events
        $rootScope.$on('match:resetVerify', function(evt, data) { //jshint unused:false
            //$log.debug('Ravi: resetVerify');
            $scope.issues = [];
            $scope.showVerify = true;
        });
    }

    $scope.verify = function () {
        $scope.issues = [];
        var scoreIssues = ScoreVerifier.verifyInning($scope.innings[0]);
        console.log(scoreIssues.issues);
        scoreIssues.concatIssues(ScoreVerifier.verifyInning($scope.innings[1]));
        scoreIssues.concatIssues(ScoreVerifier.verifyMatchStatus($scope.innings[0], $scope.innings[1], $scope.matchScore));
        $scope.issues = scoreIssues.issues;
        $scope.showVerify = $scope.issues.length > 0;
        $scope.hasRunVerifyOnce = true;
    };

    $scope.submit = function() {
        var cancelSubmit = function () {
            console.log('Cancel ScoreSheet Submit');
        };
        console.log("Submitting Scoresheet");
        var saveModal = ModalService.loadingModal('Submitting ScoreSheet, it will take a few seconds:', cancelSubmit);

        var s = flattenMatchScoreSheet(true);
        var successFunc = function (res) {
            s.id = res.id;
            $scope.lastSavedDate = res.saved;
            // Now that we have submitted successfully, delete this scoresheet
            console.log("Finished Submitting");
            if (saveModal) {
                $timeout(function () {
                    saveModal.dismiss('Finished Submitting');
                    // route to to view
                    $state.go('matches.iview', {id: $scope.id});
                }, 2000);
            }
        };
        var failureFunc = function (err) {
            console.error("Error in Submitting the ScoreSheet", err);
            if (saveModal) {
                $timeout(function () {
                    saveModal.dismiss('Finished Submitting');
                }, 2000);
            }
        };
        ScoreSheet.submitScoreSheet(s, successFunc, failureFunc);

        /*
        if (saveModal) {
            $timeout(function () {
                saveModal.dismiss('Finished Submitting');
            }, 2000);
        }
        */
    };

    $scope.saveDraft = function () {
        var cancelSave = function () {
            console.log('Cancel Scoresheet save');
        };
        var saveModal = ModalService.loadingModal('Saving ScoreSheet:', cancelSave);

        var s = flattenMatchScoreSheet();
        //console.log(s);
        ScoreSheet.upsertScoreSheet(s, function (res) {
            s.id = res.id;
            $scope.lastSavedDate = res.saved;
            if (saveModal) {
                $timeout(function () {
                    saveModal.dismiss('Finished Saving');
                }, 2000);
            }
        });
    };

    function handleSubmitted() {
        $log.info("Now retrieving Submitted Match");

        Match.getScoreSheet($scope.match.id).then(function (res) {
            $log.info('Submitted Match', res);
            $scope.match = res;
            loadSubmitted();
        });
    }

    function handleUnSubmitted() {
        ScoreSheet.getMatchScoreSheet($scope.match.id).then(function (s) {
            $scope.matchScoreSheet = s.length > 0 ? s[0] : {};
            if ($scope.matchScoreSheet.id) {
                confirmWithUser();
                $scope.lastSavedDate = $scope.matchScoreSheet.saved;
            } else {
                setupWatches();
            }
        });
    }

    /* Actual code execution begins here */
    function init() {
        $scope.teams = [];
        var matchId = $scope.id;
        Match.getMatch(matchId).then(function (res) {
            $scope.match = res;
            $scope.matchIsSubmitted = $scope.match.scoreSheetStatus === "submit";
            $scope.showSaveButton =  !$scope.matchIsSubmitted;
            $scope.matchIsLock = $scope.match.lock;
            // No need to retrieve any details
            if ($scope.matchIsSubmitted && $scope.match.lock) {
                $log.info("Match Scoresheet is submitted and locked, redirecting to view");
                $state.go('matches.iview', {'id': matchId});
                return;
            } else if ($scope.matchIsLock) {
                $log.info("Match Scoresheet is locked, Can't edit");
                return;
            }

            getTeams($scope.match.teamOne.id, $scope.match.teamTwo.id).then(function (teams) { //jshint unused:false
                $log.info("Received teams: ", teams);
                // ScoreSheet filter returns an Array of matching match.id, which is always of the size 1, since
                // match.id is unique. So if we haven't found
                if ($scope.matchIsSubmitted) {
                    handleSubmitted();
                } else {
                    handleUnSubmitted();
                }
            });
        }).catch(function(err) { //jshint unused:false
            $log.error("Match Not Found:" + matchId);
            $scope.match = undefined;
            setStatus(MATCH_STATUS.ERROR, "Match Not Found");
        });
    }
    /* Initial code execution begin here */
    init();

};