'use strict';
module.exports = function($scope, Player, $log) {
    console.log('Players control');
    $scope.players = [];
    function init() {
      Player.getAdminList($scope.id)
      .then(function (result) {
        $scope.players = result.players;
        console.log("Received Admin List", result.players);
      })
      .catch(function (err) {
        $log.error("Error in getting Admin List", err);
      });
    }
    init();
};