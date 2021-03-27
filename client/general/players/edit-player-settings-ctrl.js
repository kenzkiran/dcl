'use strict';
module.exports = function ($log, $rootScope, $scope, $state, $stateParams, Player) {
  var PlayerProfileStatus = {
    success: 'success',
    error: 'error',
    init: 'init'
  };
  $scope.statusString = "";

  $scope.status = PlayerProfileStatus.init;
  $scope.player = undefined;
  $scope.personalDetails = {};

  $scope.newUser = {
    currentpassword: "",
    password: "",
    matchpassword: ""
  };

  $scope.shouldActivateButton = function () {
    return $scope.statusString === "OK";
  };

  $scope.$watch('newUser', function (newValue, oldValue) { // jshint unused:false
    if (!newValue) {
      $scope.statusString = "Passwords don't match";
      return;
    }

    if (!newValue.currentpassword || newValue.currentpassword === "") {
      $scope.statusString = "Empty current password not allowed";
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
  }, true);

  $scope.save = function () {
    console.log("Saving player with id", $scope.id);
    Player.upsertPlayer($scope.player, function (err, player) {
      if (err || !player) {
        $scope.status = PlayerProfileStatus.error;
        console.log("Failed to update player profile: id: ", $scope.id, err);
        return;
      }
      console.log("Player profile updated ", player);
      $state.go('players.instance', { id: $scope.id });
    });
  };

  $scope.changePassword = function () {
    $scope.newUser.id = $scope.player.id;
    Player.changePassword($scope.newUser, function (err) {
      if (err) {
        $scope.statusString = "Error in password change";
      } else {
        $state.go('players.instance', { id: $scope.player.id });
        $scope.statusString = "Success";
      }
    });
  };

  function getPlayer() {
    console.log("Get Player In Settings");
    $rootScope.checkLogin(function (player) {
      console.log("Inside Done ", player);
      if (player) {
        //console.log("Got Player in Settings ", player);
        $scope.status = PlayerProfileStatus.success;
        $scope.player = player;
        getPersonalDetails(player.id);
      } else {
        $scope.status = PlayerProfileStatus.error;
        console.error("Player Not Logged In");
      }
    });
  }

  function getPersonalDetails(playerId) {
    $log.info("Getting player profile:", playerId);
    Player.getPersonalDetails(playerId)
      .then(function (p) {
        $scope.playerPersonalDetails = p;
      })
      .catch(function (err) {
        $log.error("Player details with: " + playerId + " not found", err);
      });
  }

  function init() {
    getPlayer();
  }

  //code starts here
  init();
};
