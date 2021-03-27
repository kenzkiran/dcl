module.exports = function($scope, $stateParams, Tournament, DclCommon, $location, $anchorScroll) {
    $scope.id = $stateParams.id;
    $scope.tournament = null;
    $scope.tourneyStats = null;
    $scope.teams = [];
    $scope.sortedTeams = [];
    $scope.teamSelectedForStat = undefined;
    $scope.showTeamStats = function(team) {
        console.log("Clicked show team stat");
        $scope.teamSelectedForStat = team;
        $location.hash('teamStat');
        $anchorScroll();
    };

    $scope.formatFieldingStat = function(fs) {
      var formatted = '(0/0/0)';
      if (!fs) {
          return formatted;
      }
      return fs.total + '(' + fs.totalCatches + '/' + fs.totalRunouts + '/' + fs.totalStumps + ")";
    };

    $scope.formatBestFielding= function(fs) {
        var formatted = '(0/0/0)';
        if (!fs) {
            return formatted;
        }
        fs.total = fs.catches + fs.runouts + fs.stumps;
        return fs.total + '(' + fs.catches + '/' + fs.runouts + '/' + fs.stumps + ")";
    };


    function TeamStandingComparator(t1, t2) {
        t1.wins = parseInt(t1.wins);
        t2.wins = parseInt(t2.wins);
        if (t1.wins > t2.wins) {return -1;}

        if (t2.wins > t1.wins) {return 1;}

        t1.netRR = parseFloat(t1.netRR);
        t2.neRR  = parseFloat(t2.netRR);
        // if both wins are same, compare effective run rate
        if (t1.netRR > t2.netRR) {return -1;}

        if (t2.netRR > t1.netRR) {return 1;}

        return 0;
    }

    // TODO(Ravi): Add penalty model here
    function appendPoints(team) {
        team.points = 0;
        if (team.wins > 0) {
            team.points += team.wins * DclCommon.winPoints;
        }
        if (team.ties > 0) {
            team.points += team.ties * DclCommon.tiePoints;
        }
    }
    function appendRunRates(team) {
        team.forRR = 0.0;
        team.againstRR = 0.0;
        team.netRR = 0.0;
        if (team.forRuns > 0 && team.forOvers > 0) {
            team.forRR = parseFloat(team.forRuns/ team.forOvers).toFixed(3);
        }
        console.log(team.teamName + " For: " + team.forRuns + "/" + team.forOvers + " = " + team.forRR);

        if (team.againstRuns > 0 && team.againstOvers > 0) {
            team.againstRR = parseFloat(team.againstRuns/ team.againstOvers).toFixed(3);
        }
        //console.log(team.teamName + " Against:" + team.againstRuns + "/" + team.againstOvers + " = " + team.againstRR);

        team.netRR = parseFloat(team.forRR - team.againstRR).toFixed(3);
        console.log("Effective RR: " + team.netRR);
    }

    function appendRunRatesAndPoints(team) {
       appendRunRates(team);
       appendPoints(team);
    }

    function sortTeams(unsorted) {
        unsorted.forEach(appendRunRatesAndPoints);
        return unsorted.sort(TeamStandingComparator);
    }

    function getTournamentStats() {
        console.log("Getting TournamentStats :" + $scope.id);
        Tournament.getTourneyStats($scope.id).then(function(tourneyStats) {
            $scope.tourneyStats = tourneyStats;
            console.log($scope.tourneyStats);
            $scope.teams = $scope.tourneyStats.teams;
            $scope.notPlayedTeams = _.filter($scope.teams, function(t) {return t.numPlayed === 0;});
            $scope.playedTeams = _.filter($scope.teams, function(t) {return t.numPlayed !== 0;});
            $scope.sortedTeams = sortTeams($scope.playedTeams);
            $scope.teamSelectedForStat = $scope.sortedTeams.length ? $scope.sortedTeams[0] : undefined;
        });
    }

    console.log('Tournament Team Standings controller');
    getTournamentStats();
};