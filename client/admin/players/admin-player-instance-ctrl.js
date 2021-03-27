"use strict";
module.exports = function ($scope, Player, $modalInstance, info) {
  $scope.player = info.player;
  $scope.status = "";
  $scope.hasChanged = function () {
    return $scope.originalApproved !== $scope.approved ||
      $scope.originalCertified !== $scope.certified ||
      $scope.originalCertLevel !== $scope.certLevel;
  };

  $scope.getTextForValue = function (value) {
    return (value === true) ? "Yes" : "No";
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.update = function () {
    $scope.status = "";
    var updatedPlayer = _.clone(info.player);
    updatedPlayer.approved = $scope.approved === "true" ? true : false;
    updatedPlayer.certified = $scope.certified === "true" ? true : false;
    updatedPlayer.certLevel = parseInt($scope.certLevel);
    Player.upsertPlayer(updatedPlayer, function (err, player) {
      if (err || !player) {
        console.error("Failed to update player profile: id: ", $scope.player.id, err);
        return;
      }
      GetPlayerInfo(updatedPlayer.id, (players) => {
        console.log(players);
        if (players.length === 0) {
          $scope.status = "Error in Getting Player Info, Retry";
          return;
        }
        $scope.player = players[0];
        $scope.status = "Update Successful";
        init();
      });
    });
  };

  function GetPlayerInfo(id, cb) {
    Player.getAdminList(id).then((result) => {
      console.log("Recieved Players Info", result);
      cb(result.players);
    });
  }

  function init() {
    GetPlayerInfo($scope.player.id, (players) => {
      if (players.length > 0) {
        $scope.player = players[0];
        console.log($scope.player);
        $scope.emailVerified = $scope.player.owner.emailVerified || false;
        $scope.approved = $scope.player.approved ? "true" : "false";
        $scope.certified = $scope.player.certified ? "true" : "false";
        $scope.certLevel = $scope.player.certLevel.toString();

        $scope.originalApproved = $scope.approved;
        $scope.originalCertified = $scope.certified;
        $scope.originalCertLevel = $scope.certLevel;
      }
    });
  }

  /* Execution start here */
  init();
};
