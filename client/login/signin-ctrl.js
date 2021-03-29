module.exports = function ($rootScope, $scope, $log, $state, Player) {
  console.log("Signin Ctrl");
  $scope.user = {
    email: "",
    password: ""
  };

  $scope.showResult = undefined;
  $scope.statusString = "";
  var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  $scope.checkEmail = function () {
    return email_regex.exec($scope.user.email) === null;
  };

  $scope.enabled = function () {
    return false;
  };

  $scope.signin = function () {
    Player.signIn($scope.user, function (token, err) {
      if (token) {
        $scope.statusString = "User login Success";
        var userId = Player.getCookieUserId();
        if (userId) {
          Player.getPlayerByUserId(userId).then(
            function (p) {
              $rootScope.checkLogin();
              $state.go('players.instance', {id: p[0].id});
            }, function (err) {
              $state.go('about');
              console.log("Failed to get Player details", err);
            });
        }
      } else {
        $scope.statusString = "User login Failed : " + err.message;
      }
      $scope.showResult = true;
    });
  };
};