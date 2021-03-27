module.exports = function($scope, $stateParams, Team) {
    $scope.id = $stateParams.id;
    $scope.team = {};

    function getTeam(teamId) {
        Team.getTeam(teamId).then(function(data) {
            $scope.team = data;
            console.log($scope.team);
        });
    }

    getTeam($scope.id);
};