'use strict';
module.exports = function($scope, Team, TeamAddModal, ModalService) {
    console.log('Teams control');
    $scope.teams = [];

    var getTeams = function() {
        Team.getTeams().then(function(data) {
            $scope.teams = data;
            //console.log($scope.teams);
            $scope.teams.forEach(extractRoles);
        });
    };

    function extractRoles(team) {
        team.role = {
            captain: "Captain Not Assigned",
            vice: "Vice Not Assigned",
            admin: "Admin Not Assigned"
        };

        if (team.captain) {
            team.role.captain = team.captain.firstName + " " + team.captain.lastName;
        }

        if (team.vice) {
            team.role.vice = team.vice.firstName + " " + team.vice.lastName;
        }

        if (team.admin) {
            team.role.admin = team.admin.firstName + " " + team.admin.lastName;
        }

        team.namepostfix = Team.teamTypeToPostfix(team.type);
    }
    $scope.edit = function(team) {
        var info = {team: team};
        var modalInstance = ModalService.addModal(TeamAddModal, 'TeamAddInstanceCtrl', info);
        modalInstance.result.then(function(newTeam) {
            console.log("New Team: " + JSON.stringify(newTeam));
            Team.upsertTeam(newTeam).then(function() {
                getTeams();
            });
        }, function() {
            console.log("Modal dismissed");
        });
    };

    $scope.toggleActive = function(team) {
        team.active = !team.active;
        Team.upsertTeam(team).then(function() {
            getTeams();
        });
    };
    getTeams();
};



