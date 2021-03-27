'use strict';
module.exports = function($scope, $modalInstance, info) {

    $scope.players = info.players;
    $scope.team = info.team;

    $scope.selectedPlayerId = undefined;
    if (info.role === 'Admin') {
        $scope.role = 'Admin';
        $scope.selectedPlayerId = $scope.team.adminId;
    } else if(info.role === 'Captain') {
    	$scope.role = 'Captain';
        $scope.selectedPlayerId = $scope.team.captainId;
    } else if (info.role === 'Vice') {
    	$scope.role = 'Vice-Captain';
        $scope.selectedPlayerId = $scope.team.viceId;
    }

    $scope.previouslySelectedId = $scope.selectedPlayerId;
    $scope.showDone = false;

    $scope.assignRole = function(selectedPlayerId) {
        $scope.selectedPlayerId = selectedPlayerId;
        $scope.showDone = $scope.previouslySelectedId !== $scope.selectedPlayerId;
        console.log("Assigning role " + $scope.role + " to " + $scope.selectedPlayerId);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.done = function() {
        $modalInstance.close($scope.selectedPlayerId);
    };
};
