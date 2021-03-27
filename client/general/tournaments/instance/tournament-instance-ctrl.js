module.exports = function($scope, $stateParams,Tournament) {
    $scope.id = $stateParams.id;
    $scope.tournament = null;

    function getTournament() {
        console.log("Getting Tournament :" + $scope.id);
        Tournament.getTourney($scope.id).then(function(tourney) {
            $scope.tournament = tourney;
        });
    }
    console.log('Tournament instance generic controller');
    getTournament();
};