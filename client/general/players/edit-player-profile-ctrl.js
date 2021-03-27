'use strict';
module.exports = function ($log, $rootScope, $scope, $state, $stateParams, Player, DclCommon) {
  var PlayerProfileStatus = {
    success: 'success',
    error: 'error',
    init: 'init'
  };
  $scope.statusString = "";

  $scope.certificationLevels = DclCommon.UmpireCertificationLevels;
  $scope.bowlingStyles = DclCommon.bowlingStyles;
  $scope.battingStyles = DclCommon.battingStyles;

  $scope.id = $stateParams.id;
  $scope.status = PlayerProfileStatus.init;
  $scope.player = undefined;

  $scope.save = function () {
    console.log("Saving player with id", $scope.id);
    Player.upsertPlayer($scope.player, function (err, player) {
      if (err || !player) {
        $scope.status = PlayerProfileStatus.error;
        console.log("Failed to update player profile: id: ", $scope.id, err);
        return;
      }
      console.log("Player profile updated ", player);
      $state.go('players.instance', {id: $scope.id});
    });
  };

  function getPlayer() {
    Player.getPlayer($scope.id)
      .then(function (p) {
        $scope.status = PlayerProfileStatus.success;
        $scope.player = p;
        console.log("Player received ", p);
      })
      .catch(function (err) {
        $scope.status = PlayerProfileStatus.error;
        $log.error("Player with " + $scope.id + " not found", err);
      });
  }


  function init() {
    getPlayer();
  }

  //code starts here
  init();
};
