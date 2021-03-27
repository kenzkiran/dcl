module.exports = function ($rootScope, $scope, $state, $stateParams, $log, DclCommon, ModalService, Team, Player, TeamPlayerAddRoleView) {
  $scope.id = $stateParams.id;
  $scope.team = {};
  $scope.is_team_admin = false;
  // list of active players
  $scope.players = [];
  // list of inactive players
  $scope.iaplayers = [];
  $scope.certificationLevels = DclCommon.UmpireCertificationLevels;
  $scope.completedMatches = [];
  $scope.matches = [];
  $scope.umpiring = [];
  $scope.formGuide = [];
  console.log("General Team Instance");

  function FormGuide(result, againstTeam) {
    this.result = result;
    this.details = "vs " + againstTeam;
    if (this.result === "W")
      this.class = "won-label";
    else if (this.result === "L")
      this.class = "lost-label";
    else
      this.class = "noresult-label";
  }

  function EvaluateTeamAdmin() {
    $rootScope.checkLogin(function(p) {
      if ($scope.team.captainId === p.id
          || $scope.team.viceId === p.id
          || $scope.team.adminId === p.id) {
        $scope.is_team_admin = true;
      }
    });
  }

  // Gets the team with teamId
  function getTeam(teamId) {
    Team.getTeam(teamId).then(function (data) {
      console.log("Got Team ", data);
      $scope.team = data;
      //console.log($scope.team);
      EvaluateTeamAdmin();
      getPlayers();
      getCompletedMatches();
      getMatches();
      getUmpiring();
    });
  }

  // Get the players for the given team and sorts them
  function getPlayers() {
    Team.getPlayers($scope.team.id).then(function (res) {
      //console.log('getPlayers: ' + JSON.stringify(res));
      $scope.players = setRolesForPlayers(res);

      $scope.players.sort(playerDesignationComperator);

      var sorted = sortActiveInactivePlayers($scope.players);
      console.log($scope.players);
      $scope.players = sorted.active;
      $scope.iaplayers = sorted.inactive;
    });
  }

  function createFormGuide(matches) {
    $scope.formGuide = $scope.completedMatches.map(function (m) {
      var againstTeamName = ($scope.team.id === m.teamOneId) ? m.teamTwo.name : m.teamOne.name;
      if (m.status !== 'Won') {
        return new FormGuide("NR", againstTeamName);
      }
      if (m.winTeamId === $scope.team.id) {
        return new FormGuide("W", againstTeamName);
      } else {
        return new FormGuide("L", againstTeamName);
      }
    });
  }

  function getCompletedMatches() {
    console.log("Get Completed Matches");
    Team.getCompletedMatches($scope.team.id).then(function (res) {
      console.log(res.matches);
      $scope.completedMatches = res.matches;
      createFormGuide($scope.completedMatches);
    });
  }

  function getMatches() {
    console.log("Get Matches");
    Team.getMatches($scope.team.id).then(function (res) {
      console.log(res.matches);
      $scope.matches = res.matches;
      console.log("Matches : ", res.matches);
    });
  }

  function getUmpiring() {
    console.log("Get Umpiring");
    Team.getUmpiring($scope.team.id).then(function (res) {
      console.log(res.matches);
      $scope.umpiring = res.matches;
      console.log("Umpiring : ", res.matches);
    });
  }

  // sort players into this struct: {active: [], inactive:[]}
  function sortActiveInactivePlayers(players) {
    var sortedPlayers = { active: [], inactive: [] };
    for (var i = 0; i < players.length; ++i) {
      if (players[i].active) {
        sortedPlayers.active.push(players[i]);
      } else {
        sortedPlayers.inactive.push(players[i]);
      }
    }
    return sortedPlayers;
  }

  // sets roles for players based on team's current admin/vice/captain id
  function setRolesForPlayers(players) {
    _.map(players, function (p) {
      p.isCaptain = ($scope.team.captainId === p.id);
      p.isViceCaptain = ($scope.team.viceId === p.id);
      p.isAdmin = ($scope.team.adminId === p.id);
    });
    return players;
  }

  function playerDesignationComperator(p1, p2) {
    if (p1.isAdmin) { return -1; }
    if (p2.isAdmin) { return 1; }

    if (p1.isCaptain) { return -1; }
    if (p2.isCaptain) { return 1; }

    if (p1.isViceCaptain) { return -1; }
    if (p2.isViceCaptain) { return 1; }

    if (p1.firstName < p2.firstName) { return -1; }
    if (p1.firstName > p2.firstName) { return 1; }

    if (p1.lastName < p2.lastName) { return -1; }
    if (p1.lastName > p2.lastName) { return 1; }
    return 0;
  }

  $scope.addPlayer = function () {
    var teamId = $scope.team.id;
    console.log('Add Player to Team: ', teamId);
    $state.go('teams.addPlayer', { id: teamId });
  };

  $scope.removePlayer = function (player) {
    var teamId = $scope.team.id;
    console.log('Remove Player from Team: ', teamId, player.id);

    let yes = function() {
      Player.removePlayerFromTeam(player.id, teamId, function (err) {
        if (err) {
          console.log("Error Removing Player from Team: ", err);
        } else {
          console.log("Success in Removing Player");
          getPlayers();
        }
      });
    }
    let no = function() {
      console.log("Player not removed");
    }
    let msg = "Do you want to remove player: " +  player.firstName + " " + player.lastName;
    ModalService.confirmModal(msg, yes, no);

  }

  // TODO(Ravi): Can a captain be admin also ? More than one role
  // For now we remove any old roles
  function removePlayerCurrentRoleInTeam(selectedPlayerId) {
    if ($scope.team.captainId === selectedPlayerId) {
      $scope.team.captainId = null;
    } else if ($scope.team.viceId === selectedPlayerId) {
      $scope.team.viceId = null;
    } else if ($scope.team.adminId === selectedPlayerId) {
      $scope.team.adminId = null;
    }
  }

  function assignPlayerRole(role, selectedPlayerId) {
    removePlayerCurrentRoleInTeam(selectedPlayerId);
    if (role === 'Captain') {
      $scope.team.captainId = selectedPlayerId;
    } else if (role === 'Vice') {
      $scope.team.viceId = selectedPlayerId;
    } else if (role === 'Admin') {
      $scope.team.adminId = selectedPlayerId;
    }
    Team.upsertTeam($scope.team);
    $log.info("Assigned role " + role + " to player " + selectedPlayerId);
    getPlayers();
  }

  $scope.isCaptain = function (playerId) {
    return $scope.team.captainId && $scope.team.captainId == playerId;
  };

  $scope.isVice = function (playerId) {
    return $scope.team.viceId && $scope.team.viceId == playerId;
  };

  $scope.isAdmin = function (playerId) {
    return $scope.team.adminId && $scope.team.adminId == playerId;
  };

  $scope.setRole = function (role) {
    var info = { role: role, players: $scope.players, team: $scope.team };
    var modalInstance = ModalService.addModal(TeamPlayerAddRoleView, 'TeamPlayerAddRoleCtrl', info);
    modalInstance.result.then(function (selectedPlayerId) {
      assignPlayerRole(role, selectedPlayerId);
    }, function () {
      console.log("Modal dismissed");
    });
  };
  console.log("Ravi Getting Team");
  getTeam($scope.id);
};