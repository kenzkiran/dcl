module.exports = function ($scope, $modalInstance, info) {
    $scope.isEdit = false;
    if (info.ground) {
        $scope.isEdit = true;
        $scope.task = 'EDIT';
        $scope.newGround = angular.copy(info.ground);
        if ($scope.newGround.active !== null && $scope.newGround.active !== undefined) {
            $scope.newGround.active = $scope.newGround.active.toString();
        }
        else {    
            $scope.newGround.active = "true";
        }
    } else {
        $scope.task = 'ADD';
        $scope.newGround = {name: "", address: "", city: "", url: "", active: "true"};
    }

    $scope.add = function () {
        $scope.newGround.active = ($scope.newGround.active === "true") ? true : false;
        $modalInstance.close($scope.newGround);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
