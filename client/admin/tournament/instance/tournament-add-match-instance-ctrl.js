module.exports = function($scope, $filter, $modalInstance, info) {
    $scope.teams = info.teams;
    $scope.grounds = info.grounds;
    $scope.umpiringTeams = info.umpiringTeams || info.teams;
    $scope.match = {};
    $scope.task = 'ADD';
    $scope.isEdit = info.match ? true : false;
    if (info.match) {
        $scope.task = 'EDIT';
        $scope.match = angular.copy(info.match);
    } else {
        $scope.match = {ground: $scope.grounds[0], lock: true};
    }

    $scope.toggleLock = function() {
        $scope.match.lock = !$scope.match.lock;
    };
    $scope.add = function() {
        $modalInstance.close($scope.match);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    // set matchdate to today if not available
    $scope.format = 'dd-MMMM-yyyy';
    $scope.match.date = $scope.match.date || new Date();
    $scope.status = {
        opened: false
    };
    $scope.open = function($event) {
        console.log($event);
        $scope.status.opened = true;
    };
};
