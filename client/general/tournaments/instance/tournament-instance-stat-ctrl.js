module.exports = function($scope, $stateParams, Tournament) {
    $scope.id = $stateParams.id;
    $scope.tournament = null;
    $scope.tourneyStats = null;

    function extractSummary(summary) {
        var topRunAverage = summary.topRunAverage;
        var topRunAggregate = $scope.topRunAggregate[0] || {};
        var topBowlingAverage = summary.topBowlingAverage;
        var topBowlingEconomy = summary.topBowlingEconomy;
        var topBattingScore = summary.topBattingScore;
        var topWicketTaker = $scope.topWicketTakers[0] || {};
        console.log(summary);

        $scope.summary = [];
        function addSummaryStat(statName, firstName, lastName, teamName, figure) {
            $scope.summary.push( {
                Statistics: statName,
                PlayerName: firstName + " " + lastName,
                TeamName: teamName,
                Figures: figure
            });
        }

        addSummaryStat("Best Batting Average", topRunAverage.firstName,
            topRunAverage.lastName, topRunAverage.teamName, topRunAverage.stats.batting.average);

        addSummaryStat("Best Batting Aggregate",topRunAggregate.firstName, topRunAggregate.lastName,
            topRunAggregate.teamName,topRunAggregate.stats.batting.totalRuns);

        addSummaryStat("Highest Score",topBattingScore.firstName, topBattingScore.lastName,
            topBattingScore.teamName,topBattingScore.stats.batting.topScore.runs);

        addSummaryStat("Top Wicket Taker", topWicketTaker.firstName,topWicketTaker.lastName,
            topWicketTaker.teamName, topWicketTaker.stats.bowling.totalWickets);

        addSummaryStat("Best Economy Rate",topBowlingEconomy.firstName,topBowlingEconomy.lastName,
            topBowlingEconomy.teamName,topBowlingEconomy.stats.bowling.economyRate);

        addSummaryStat("Best Bowling Average",topBowlingAverage.firstName,topBowlingAverage.lastName,
            topBowlingAverage.teamName,topBowlingAverage.stats.bowling.average);
    }

    function getTournamentStats() {
        console.log("Getting TournamentStats :" + $scope.id);
        Tournament.getTourneyStats($scope.id).then(function(tourneyStats) {
            $scope.tourneyStats = tourneyStats;
            $scope.topRunAggregate = tourneyStats.topRunAggregate;
            $scope.topWicketTakers = tourneyStats.topWicketTakers;
            extractSummary(tourneyStats.summary);
            //console.log($scope.topWicketTakers);
        });
    }
    console.log('Tournament instance stats controller');
    getTournamentStats();
};