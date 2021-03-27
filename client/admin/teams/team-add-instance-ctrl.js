module.exports = function($scope, $filter, $modalInstance, info, DclCommon) {
    $scope.isEdit = false;
    $scope.types = DclCommon.gameTypes;
    if (info.team) {
        $scope.isEdit = true;
        $scope.task = 'EDIT';
        $scope.newTeam = angular.copy(info.team);
    } else {
        $scope.task = 'ADD';
        $scope.newTeam = {};
    }

    $scope.add = function() {
        $modalInstance.close($scope.newTeam);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};
