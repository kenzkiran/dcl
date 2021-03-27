module.exports = function ($scope, $state, $window, Player, Team, DclCommon) {
  console.log("New Team Registration Ctrl");
  $scope.types = DclCommon.gameTypes;
  $scope.showResult = false;
  $scope.statusString = "";
  // status goes from "init" -> "verified" -> "requested"
  $scope.status = "init";
  $scope.newTeam = {
    name: "",
    type: "Tape",
    location: "",
    playerId: ""
  };

  $scope.shouldDisable = function () {
    return !$scope.newTeam.name || !$scope.newTeam.location || $scope.status === 'fail';
  };

  function HandleVerifyResponse(err, response) {
    var result = (response && response.result) || { status: 'fail' };
    if (err) {
      $scope.showResult = true;
      $scope.statusString = "Internal Error, Please try later!";
      $scope.status = 'fail';
      return;
    }
    if (result) {
      if (result.status === 'success') {
        $scope.showResult = true;
        $scope.statusString = 'Team Name Available, Click Submit Request';
        $scope.status = 'verified';
      }
      if (result.status === 'fail') {
        $scope.showResult = true;
        $scope.statusString = result.reason || "Unknown";
        $scope.status = 'fail';
        return;
      }
    }
  }

  function HandleSubmitResponse(err, response) {
    var result = (response && response.result) || { status: 'fail' };
    if (err) {
      $scope.showResult = true;
      $scope.statusString = "Internal Error, Please try later!";
      $scope.status = 'fail';
      return;
    }
    if (result) {
      if (result.status === 'success') {
        $scope.showResult = true;
        $scope.statusString = 'Request For New Team Successful';
        $scope.status = 'requested';
      }
      if (result.status === 'fail') {
        $scope.showResult = true;
        $scope.statusString = result.reason || "Unknown";
        $scope.status = 'fail';
        return;
      }
    }
  }

  $scope.verify = function () {
    console.log("Verifying New Team");
    var pinfo = $window.localStorage.getItem('pinfo');
    var info = angular.fromJson(pinfo);
    $scope.newTeam.playerId = info.playerId;
    Team.verifyNewTeamAvailabilty($scope.newTeam, function (err, response) {
      HandleVerifyResponse(err, response);
    });
  };

  $scope.submit = function () {
    console.log("Requesting New Team");
    var pinfo = $window.localStorage.getItem('pinfo');
    var info = angular.fromJson(pinfo);
    $scope.newTeam.playerId = info.playerId;
    Team.requestNewTeam($scope.newTeam, function (err, response) {
      HandleSubmitResponse(err, response);
    });
  };
};