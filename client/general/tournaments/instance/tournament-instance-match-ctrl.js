module.exports = function($scope, $stateParams, Match, Tournament, highlight) {
    $scope.id = $stateParams.id;
    $scope.matches = [];
    $scope.tournament = null;
    $scope.highlight = function(text) {
        return highlight.highlightSearchedText($scope.searchText, text);
    };

    function getTournament() {
        console.log("Getting Tournament :" + $scope.id);
        Tournament.getTourney($scope.id).then(function(tourney) {
            $scope.tournament = tourney;
        });
    }

    function getMatches(tournamentId) {
        Match.getTournamentMatches(tournamentId, "date ASC").then(function(matches) {
            $scope.matches = matches;
        });
    }
    console.log('Tournament instance matches controller');
    getTournament();
    getMatches($scope.id);
};