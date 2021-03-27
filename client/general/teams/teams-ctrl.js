'use strict';
module.exports = function($scope, Team) {
    console.log('General Teams Controller');
    $scope.teams = [];

    var getTeams = function() {
        Team.getTeams("name ASC").then(function(data) {
            $scope.teams = data;
            console.log($scope.teams);
            for (var i = 0; i < $scope.teams.length; ++i) {
                var t = $scope.teams[i];
                if (!t.division) {
                    t.division = {name: 'Div Not Assigned', demography: {ageGroup: 'Professional', gender: 'Male'}};
                }
            }
        });
    };

    $scope.teamTypeToPostfix = function(type) {
        return Team.teamTypeToPostfix(type);
    }
    getTeams();
};
