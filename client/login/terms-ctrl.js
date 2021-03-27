module.exports = function ($scope, $modalInstance) {
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.agree = function() {
    $modalInstance.close();
  };
};
