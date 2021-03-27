'use strict';
module.exports = function($scope, Tournament) {
    $scope.tournaments = [];

    var getTournaments = function() {
        Tournament.getTournaments(["endDate DESC", "name ASC"]).then(function(tourneys) {
            $scope.tournaments = tourneys;
        });
    };

    // Controller execution starts below
    console.log('General TournamentCtrl');
    getTournaments();
};
