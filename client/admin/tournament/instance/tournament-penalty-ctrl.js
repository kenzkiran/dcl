module.exports = function ($scope, $filter, $timeout, Tournament, ModalService, $modalInstance, info) {
  $scope.tournament = info.tourney;
  $scope.teams = info.tourney.teams;
  $scope.penalties = [];
  $scope.newPenalty = { isbonus: false, points: 2, team: undefined };

  $scope.addPenalty = function () {
    if ($scope.newPenalty.team) {
      var penalty = {};
      penalty.reason = $scope.newPenalty.reason;
      penalty.points = $scope.newPenalty.points;
      penalty.isbonus = $scope.newPenalty.isbonus;
      Tournament.addPenaltyForTeam($scope.tournament.id, $scope.newPenalty.team.id, penalty, function (err) {
        if (err) {
          console.log("Error Updating Penalty: ", err);
        }
        updatePenalties();
        $scope.newPenalty = { isbonus: false, points: 2, team: undefined };
      });
    }
  };

  $scope.removePenalty = function (penaltyId) {
    Tournament.removePenalty(penaltyId, function (err) {
      if (!err) {
        console.log("Success in removal of penalty");
      } else {
        console.log("Failure in removal of penalty:", err);
      }
      updatePenalties();
    });
  };

  function updatePenalties() {
    Tournament.getPenaltiesForTournament($scope.tournament.id).then(function (result) {
      console.log("Penalties :");
      $scope.penalties = result.penalties;
    });
  }
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };


  function init() {
    updatePenalties();
  }

  /* Execution start here */
  init();
};
