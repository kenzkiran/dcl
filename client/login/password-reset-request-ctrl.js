module.exports = function ($rootScope, $scope, $log, $state, Player) {
  console.log("Signin Ctrl");
  $scope.email = "";
  $scope.showResult = undefined;
  $scope.statusString = "";
  $scope.emailSent = false;
  var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  $scope.checkEmail = function () {
    return email_regex.exec($scope.email) === null;
  };

  $scope.requestResetPassword = function () {
    console.log("Now resetting password for : ", $scope.email);
    Player.RequestResetPassword($scope.email , function (err) {
        if (err) {
          $scope.statusString = "Error in Password Reset";
          $scope.showResult = true;
          return;
        }
        $scope.statusString = "Password Reset Success: Check Email for Password Reset Link";
        $scope.showResult = true;
        $scope.emailSent = true;
      });
  };

};