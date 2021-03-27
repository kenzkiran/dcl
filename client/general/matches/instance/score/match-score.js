var ScoreUtils = require('./score-utils');
//var playerToId = ScoreUtils.playerToId;
var idToPlayer = ScoreUtils.idToPlayer;
//var concatPlayerName = ScoreUtils.concatPlayerName;

module.exports = ['$rootScope', '$log', 'DclCommon', 'InningScore', function($rootScope, $log, DclCommon, InningScore) {
    var InningScore = InningScore.InningScore;
    //var ScoreTotals = InningScore.ScoreTotals;

    function MatchScore(match, teams, scoreSheet) {
        // TODO: Assert if nil
        this.match = match;
        this.teams = teams;
        this._reset();
        // we can't load if we don't have match details or team details
        if (this.match && this.teams) {
            this._extractData(scoreSheet);
        }
    }

    MatchScore.prototype = {
      setTossWinner: function(tossWinnerId, tossChoice) {
        this._reset();
        this._loadInnings(tossWinnerId, tossChoice);
      },
      _reset: function() {
          this.previouslySaved = false;
          this.scoreSheetId = undefined;
          this.lastSaved = undefined;
          this.matchStatus = DclCommon.matchStatus;
          this.tossWinnerId = undefined;
          this.tossChoice = '';
          this.momId = undefined;
          this.momDesc = '';
          this.result = '';
          this.winTeamId = undefined;
          this.status = '';
          this.firstBattingTeamId = undefined;
          this.secondBattingTeamId = undefined;
          this.dataSource = undefined;
          this.firstBattingTeam = undefined;
          this.secondBattingTeam = undefined;
          this.innings = [];
      },
      _extractData: function(scoreSheet) {
          if (scoreSheet && scoreSheet.id) {
              this.previouslySaved  = true;
              this.lastSaved = scoreSheet.saved;
              this.dataSource = scoreSheet.score;
              this.scoreSheetId = scoreSheet.id;
          } else {
              this.previouslySubmitted = this.match.scoreSheetStatus === DclCommon.scoresheetStatus.submit;
              this.dataSource = this.match;
          }
          var dataSource = this.dataSource;
          this.tossWinnerId = dataSource.tossWinnerId;
          this.tossChoice = dataSource.tossChoice;
          this.momId = dataSource.momId;
          this.momDesc = dataSource.momDesc;
          this.result = dataSource.result || '';
          this.winTeamId = dataSource.winTeamId;
          this.status = dataSource.status;
          this._loadInnings(this.tossWinnerId, this.tossChoice, dataSource.inningOne, dataSource.inningTwo);

      },
      _findTeamById: function(id) {
        if (id === this.teams[0].id) {
            return this.teams[0];
        }  else if (id === this.teams[1].id) {
            return this.teams[1];
        }
        return;
      },
      getManOfMatch: function() {
          var mom = '';
          if (this.momId) {
              mom = idToPlayer(this.momId, this.teams[0].players);
              if (!mom) {
                  mom = idToPlayer(this.momId, this.teams[1].players);
              }
          }
          return mom;
      },
      getWinningTeam:function() {
         if (this.winTeamId) {
             return this._findTeamById(this.winTeamId);
         }
      },
      getTossWinner: function() {
        if (this.tossWinnerId) {
            return this._findTeamById(this.tossWinnerId);
        }
      },
      setBattingOrderBasedOnToss: function(tossWinnerId, tossChoice, teams) {
        tossWinnerId = tossWinnerId || this.tossWinnerId;
        tossChoice = tossChoice || this.tossChoice;
        teams = teams || this.teams;
        $log.info(tossWinnerId);
        $log.info(teams);
        $log.info(tossChoice);

        if (tossChoice === 'Bat') {
          this.firstBattingTeamId = tossWinnerId;
        } else {
          // implies first batting chose fielding, hence the other team is the first batting
          this.firstBattingTeamId = (tossWinnerId === teams[0].id) ? teams[1].id : teams[0].id;
        }
        this.secondBattingTeamId =  (this.firstBattingTeamId === teams[0].id) ? teams[1].id : teams[0].id;

        this.firstBattingTeam = this._findTeamById(this.firstBattingTeamId);
        this.secondBattingTeam = this._findTeamById(this.secondBattingTeamId);
        $log.info('MatchScore:FirstBattingTeam: ', this.firstBattingTeam.name);
        $log.info('MatchScore:SecondBattingTeam: ', this.secondBattingTeam.name);
      },
       // use this to load any previously saved innings
        _loadInnings: function(tossWinnerId, tossChoice, inningOne, inningTwo) {
        this.innings = [];
        this.tossWinnerId = tossWinnerId;
        this.tossChoice = tossChoice;
          //first lets set batting orders based on toss
        this.setBattingOrderBasedOnToss(this.tossWinnerId, this.tossChoice, this.teams);
          //now that toss is set.
        $log.info("Now trying loading Innings: inning one");
        this.inningOne = new InningScore(1, this.firstBattingTeam, this.secondBattingTeam, inningOne || {});
            $log.info("Now trying loading Innings: inning two");
        this.inningTwo = new InningScore(2, this.secondBattingTeam, this.firstBattingTeam, inningTwo || {});
        this.innings.push(this.inningOne);
        this.innings.push(this.inningTwo);
      }
    };

    return {
        MatchScore: MatchScore
    };
}];
