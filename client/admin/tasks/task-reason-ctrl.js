'use strict';
module.exports = function ($scope, $modalInstance, info) {
    $scope.originalTask = info.task;
    $scope.task = {};
    $scope.task.reason = "";
    $scope.teamName = info.task.data.name;
    $scope.teamType = info.task.data.type;
    $scope.requester = info.task.requester.firstName + " " + info.task.requester.lastName;
    console.log(info);
    $scope.submit = function () {
        //console.log("Sending Email");
        $modalInstance.close($scope.task);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
