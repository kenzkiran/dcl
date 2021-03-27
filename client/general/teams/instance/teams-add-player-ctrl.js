'use strict';

module.exports = function ($scope, $state, $stateParams, $log, DclCommon, Utils, ModalService, Team, Player) {

  $scope.team = undefined;
  $scope.id = $stateParams.id;
  $scope.players = [];
  $scope.iaplayers = [];
  $scope.searchedPlayers = [];
  $scope.searchtext = "";
  $scope.searchemail = "";
  $scope.validEmail = false;
  $scope.searchByEmailStatus = "";

  function getTeam(teamId) {
    Team.getTeam(teamId).then(function (data) {
      console.log("Got Team ", data);
      $scope.team = data;
      console.log($scope.team);
      getPlayers();
    });
  }


  function getSearchWhereFilter() {
    var splitStr = $scope.searchtext.split(/[ ,]+/);
    var firstNameSearchStr = "";
    var lastNameSearchStr = "";
    if (splitStr.length > 1) {
      firstNameSearchStr = splitStr[0];
      lastNameSearchStr = splitStr[1];
    } else if (splitStr.length > 0) {
      firstNameSearchStr = splitStr[0];
      lastNameSearchStr = splitStr[0];
    }

    var firstNameFilter = { "firstName": { "like": "^" + firstNameSearchStr, "options": "i" } };
    var lastNameFilter = { "lastName": { "like": "^" + lastNameSearchStr, "options": "i" } };
    var filter = { "where": { "or": [] } };

    if (!firstNameSearchStr && !lastNameSearchStr) {
      return {};
    }

    if (firstNameSearchStr) {
      filter.where.or.push(firstNameFilter);
    }
    if (lastNameSearchStr) {
      filter.where.or.push(lastNameFilter);
    }

    if (firstNameSearchStr) {
      filter.order = 'firstName ASC';
    } else {
      filter.order = 'lastName ASC';
    }
    return filter;
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

  // Get the players for the given team and sorts thems
  function getPlayers() {
    Team.getPlayers($scope.team.id).then(function (res) {
      $scope.players = setRolesForPlayers(res);
      // $scope.players.sort(playerDesignationComperator);
      var sorted = sortActiveInactivePlayers($scope.players);
      console.log("Players : ", $scope.players);
      $scope.players = sorted.active;
      $scope.iaplayers = sorted.inactive;
    });
  }

  function IsPlayerInTeam(player) {
    for (var i = 0; i < $scope.players.length; ++i) {
      if ($scope.players[i].id === player.id) {
        return true;
      }
    }
    return false;
  }

  $scope.searchByEmail = function () {
    Player.getPlayerByEmail($scope.searchemail).then(function (players) {
      if (players.length === 0) {
        console.log("Player Not Found for Email ", $scope.searchemail);
      } else {
        console.log("Found Player ", players[0]);
        $scope.searchedPlayers = players;
      }
    });
  };

  $scope.$watch('searchemail', function (newval, oldval) { // jshint unused:false
    $scope.searchedPlayers = [];
    $scope.validEmail = Utils.IsValidEmail(newval);
  });

  $scope.$watch('searchtext', function (newVal, oldVal) { // jshint unused:false
    if (!newVal) {
      $scope.searchedPlayers = [];
      return;
    }
    console.log("Search text: ", newVal);
    var whereFilter = getSearchWhereFilter();
    if (!whereFilter) {
      // console.log("Invalid Search String : ", newVal);
      $scope.searchedPlayers = [];
      return;
    }

    // console.log("Search Filter :", whereFilter);
    Player.getPlayersByFilter(whereFilter).then(function (players) {
      // remove DCL Admin
      var newplayers = _.reject(players, function (player) {
        return player.lastName === "Admin" && player.firstName === "DCL"
      });
      newplayers.forEach(player => {
        player.isCurrent = IsPlayerInTeam(player) ? true : false;
      });
      $scope.searchedPlayers = newplayers;
    });
  });

  $scope.addPlayer = function (player) {
    $scope.searchedPlayers = [];
    let yes = function () {
      Player.addPlayerToTeam(player.id, $scope.id, function (err, res) { // jshint unused:false
        if (err) {
          return console.log(err);
        } else {
          getPlayers();
        }
      });
    };

    let no = function () {
      console.log("Player not removed");
    };
    let msg = "Do you want to add player: " + player.firstName + " " + player.lastName;
    ModalService.confirmModal(msg, yes, no);
  };

  function init() {
    getTeam($scope.id);
  }

  init();
};