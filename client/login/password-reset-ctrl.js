module.exports = function ($rootScope, $scope, $log, $state, $location, Player) {
  console.log("Signin Ctrl");
  $scope.email = "";
  $scope.showResult = undefined;
  $scope.statusString = "";
  $scope.showStatusString = true;
  $scope.newUser = {
    password: "",
    matchpassword: ""
  };

  $scope.shouldActivateButton = function () {
    return $scope.statusString === "OK";
  };

  $scope.$watch('newUser', function (newValue, oldValue) { // jshint unused:false
    $scope.showStatusString = true;
    if (!newValue) {
      $scope.statusString = "Passwords don't match";
      return;
    }

    if (!newValue.password || newValue.password === "") {
      $scope.statusString = "Empty password not allowed";
      return;
    }

    // Check for alpha numeric only
    if (newValue.password.match(/^[0-9a-z]+$/) === null) {
      $scope.statusString = "Password not alpha numeric";
      return;
    }

    if (newValue.password === newValue.currentpassword) {
      $scope.statusString = "New password is same as old one!";
      return;
    }

    if (newValue.password !== newValue.matchpassword) {
      $scope.statusString = "Passwords don't match";
      return;
    }
    $scope.statusString = "OK";
    $scope.showStatusString = false;
  }, true);

  $scope.resetPassword = function () {
    $scope.statusString = "Resetting...";
    var searchObject = $location.search();
    console.log(searchObject);
    $scope.newUser.access_token = searchObject.access_token;
    Player.resetPassword($scope.newUser, function (err) {
      if (err) {
        $scope.statusString = "Error in Reseting Password.. Contact DCL Admin!!";
        console.log("Error in reset password");
        return;
      }
      console.log("Success in reset password");
      $scope.statusString = "Successfully Reset Password";
      setTimeout(() => { $state.go('signin'); }, 2000);
    });
  };
};