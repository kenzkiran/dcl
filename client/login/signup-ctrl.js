module.exports = function ($rootScope, $scope, Player, $log, ModalService, TermsModal, $state) {
  $scope.newUser = {
    password: "",
    matchpassword: "",
    state: "TX"
  };

  $scope.user_agreement = false;
  var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var phone_regex = /^\(?([0-9]{3})\)?[-]?([0-9]{3})[-]?([0-9]{4})$/;
  $scope.statusString = "Password Not matching";
  $scope.showResult = false;
  $scope.shouldEnableSubmit = false;

  $scope.emailOk = false;
  $scope.phoneOk = false;
  $scope.checkEmail = function () {
    $scope.emailNotOk = email_regex.exec($scope.newUser.email) === null;
    return $scope.emailNotOk;
  };

  // Verify this correctly
  $scope.checkPhone = function () {
    $scope.phoneNotOk = phone_regex.exec($scope.newUser.phone) === null;
    return $scope.phoneNotOk;
  };

  console.log("Signup Ctrl");
  $scope.$watch('newUser', function (newValue, oldValue) { // jshint unused:false
    $scope.showResult = true;
    $scope.emailNotOk = true;
    $scope.phoneNotOk = true;
    $scope.shouldEnableSubmit = false;
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

    if (newValue.password !== newValue.matchpassword) {
      $scope.statusString = "Passwords don't match";
      return;
    }
    $scope.checkEmail();
    $scope.checkPhone();
    $scope.statusString = "OK";
    $scope.shouldEnableSubmit = !!newValue.firstName && !!newValue.lastName && !$scope.phoneNotOk && !$scope.emailNotOk;
  }, true);


  $scope.showterms = function () {
    var modalInstance = ModalService.addModal(TermsModal, 'TermsCtrl', {});
    modalInstance.result.then(function () {
      console.log("User Agreed");
      $scope.user_agreement = true;
    }, function () {
      $scope.user_agreement = false;
      console.log("Modal dismissed");
      $scope.getPlayers();
    });
  };


  $scope.signup = function () {
    Player.signUp($scope.newUser, function (err, user) {
      if (err) {
        $scope.statusString = err.message;
      } else {
        $scope.statusString = "Success!";
        $rootScope.checkLogin();
        if ($rootScope.isAdmin()) {
          $state.go('players.editprofile', { id: user.id });
        } else {
          $state.go('players.editprofile', { id: user.id });
        }
      }
      $scope.showResult = true;
    });
  };
};