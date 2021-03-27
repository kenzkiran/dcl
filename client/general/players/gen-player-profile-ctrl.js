'use strict';

module.exports = function ($log, $rootScope, $window, $scope, $state, $stateParams, Player) {
  var PlayerProfileStatus = {
    success: 'success',
    error: 'error',
    init: 'init'
  };
  $scope.id = $stateParams.id;
  $scope.status = PlayerProfileStatus.init;
  $scope.player = undefined;
  $scope.stats = {};
  $scope.showEdit = false;

  //FIXME(Ravi): Change this to common function
  var IsLoggedInPlayer = function () {
    var pinfo = $window.localStorage.getItem('pinfo');
    if (pinfo) {
      pinfo = angular.fromJson(pinfo);
      return $scope.player.firstName === pinfo.firstName && $scope.player.lastName === pinfo.lastName;
    }
  };

  function getPlayer() {
    $log.info("Getting player profile:", $scope.id);
    Player.getPlayer($scope.id)
      .then(function (p) {
        $scope.status = PlayerProfileStatus.success;
        $scope.player = p;
        $scope.showEdit = IsLoggedInPlayer();
        return Player.getPlayerStats(p.id);
      })
      .then(function (stats) {
        console.log(stats);
        $scope.stats = stats.data;
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