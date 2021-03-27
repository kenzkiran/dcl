module.exports = function ($scope, $sce, $modalInstance, info) {
    $scope.ground = angular.copy(info.ground);
    $scope.ground.url = $sce.trustAsResourceUrl($scope.ground.url);

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
