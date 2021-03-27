module.exports = function($scope, $filter, $timeout, Tournament, ModalService, $modalInstance, info) {
    $scope.tournament = info.tourney;
    $scope.currentTeams = info.tourney.teams;
    $scope.allTeams = info.allTeams;

    function updateRemainingTeams() {
        $scope.remainingTeams = _.reject($scope.allTeams, function (team) {
            var found = _.findIndex($scope.currentTeams, function (current) {
                return current.id.toString() === team.id.toString();
            });
            return found >= 0;
        });
    }

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    function updateTournament() {
        console.log("Updating Tournament");
        Tournament.getTourney($scope.tournament.id).then(function (tourney) {
            $scope.tournament = tourney;
            $scope.currentTeams = tourney.teams;
            updateRemainingTeams();
        });
    }

    $scope.addTeam = function(teamId) {
        console.log('Add Team: ', teamId);
        var isModal = true;

        var modal = ModalService.loadingModal("Adding Team", function() {
            console.log("Modal Cancelled");
            isModal = false;
        });

        Tournament.addTeamToTourney($scope.tournament.id, teamId, function(err) {
            if (err) {
                console.log("Error Adding Team: " + teamId +  " to Tourney: " + $scope.tournament.id + " Error:" + err);
            } else {
                updateTournament();
                console.log("Success Adding Team: " + teamId +  " to Tourney: " + $scope.tournament.id);
            }

            if (isModal) {
                $timeout(function () {
                    modal.dismiss('Finished Adding Team to Tourney');
                }, 1000);
            }
        });
    };

    $scope.removeTeam = function(teamId) {
        console.log('Remove Team: ', teamId);
        var isModal = true;

        var modal = ModalService.loadingModal("Removing Team", function() {
            console.log("Modal Cancelled");
            isModal = false;
        });

        Tournament.removeTeamFromTourney($scope.tournament.id, teamId, function(err) {
            if (err) {
                console.log("Error Removing Team: " + teamId +  " to Tourney: " + $scope.tournament.id + " Error:" + err);
            } else {
                updateTournament();
                console.log("Success Removing Team: " + teamId +  " to Tourney: " + $scope.tournament.id);
            }

            if (isModal) {
                $timeout(function () {
                    modal.dismiss('Finished Removing Team to Tourney');
                }, 1000);
            }
        });
    };


    function init() {
        updateRemainingTeams();
    }

    /* Execution start here */
    init();
};
