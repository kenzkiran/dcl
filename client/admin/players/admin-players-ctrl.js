"use strict";
module.exports = function ($scope, $state, Player, DclCommon, ModalService, AdminPlayerInstanceModal) {
  console.log('General Player List Controller');

  $scope.links = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  $scope.players = [];
  $scope.searchText = '';
  $scope.active = '0';
  $scope.certified = '0';
  $scope.emailVerified = 'any';
  $scope.approved = '0';
  $scope.pageSize = DclCommon.PlayersPageSize;
  $scope.currentPage = 1;
  $scope.pageCount = 0;
  $scope.filteredPlayers = [];

  $scope.getPlayersByNameStartingWith = function (nameStartingWith) {
    $scope.searchText = nameStartingWith;
    $scope.active = '1';
    $scope.certified = '0';
    $scope.searchPlayers();
  };

  function emailVerifiedChanged() {
    $scope.filteredPlayers = _.filter($scope.players, function (p) {
      if ($scope.emailVerified === 'any') {
        return true;
      }
      if ($scope.emailVerified === 'true') {
        return p.owner.emailVerified === true;
      }

      if ($scope.emailVerified === 'false') {
        return p.owner.emailVerified !== true;
      }
    });
  }

  $scope.$watch('emailVerified', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      emailVerifiedChanged();
    }
  });

  $scope.edit = function (player) {
    var info = { player: player};
    var modalInstance = ModalService.addModal(AdminPlayerInstanceModal, 'AdminPlayerInstanceCtrl', info);
    modalInstance.result.then(function (updatedPlayerProfile) {
      console.log("Updated Profile: " + JSON.stringify(updatedPlayerProfile));
    }, function () {
      console.log("Modal dismissed");
      $scope.getPlayers();
    });
  };

  $scope.searchPlayers = function () {
    var totalPlayerCount = 0;
    var whereFilter = $scope.getWhereFilter();

    Player.getTotalCount(whereFilter).then(function (data) {
      totalPlayerCount = data.count;
      $scope.pageCount = Math.floor(totalPlayerCount / $scope.pageSize);

      if ((totalPlayerCount % $scope.pageSize) > 0) {
        $scope.pageCount = $scope.pageCount + 1;
      }
    });

    $scope.currentPage = 1;
    $scope.getPlayers();
  };

  $scope.getWhereFilter = function () {
    var whereFilter;

    if (($scope.searchText !== null && $scope.searchText !== undefined && $scope.searchText.length > 0) ||
      $scope.active !== '0' || $scope.certified !== '0') {
      whereFilter = {};
    }

    if ($scope.searchText !== null && $scope.searchText !== undefined && $scope.searchText.length > 0) {
      var regExp = '^' + $scope.searchText;
      whereFilter.firstName = { like: regExp, options: 'i' };
    }

    if ($scope.active !== '0') {
      whereFilter.active = ($scope.active === '1' ? true : false);
    }

    if ($scope.certified !== '0') {
      whereFilter.certified = ($scope.certified === '1' ? true : false);
    }

    console.log("whereFilter ", JSON.stringify(whereFilter));
    return whereFilter;
  };


  $scope.getPlayers = function () {
    var filter = {};
    var whereFilter = $scope.getWhereFilter();
    if (whereFilter !== null && whereFilter !== undefined) {
      filter.where = whereFilter;
    }
    filter.include = "owner";
    filter.order = 'firstName ASC';
    filter.skip = ($scope.currentPage - 1) * $scope.pageSize;
    filter.limit = $scope.pageSize;

    Player.getPlayersByFilter(filter).then(function (players) {
      $scope.players = players;
      emailVerifiedChanged();
    });
  };

  $scope.goToPlayerList = function () {
    $state.go('admin.players.list.details');
  };

  $scope.goToNextPage = function () {
    $scope.currentPage = $scope.currentPage + 1;
    $scope.getPlayers();
  };

  $scope.goToPreviousPage = function () {
    $scope.currentPage = $scope.currentPage - 1;
    $scope.getPlayers();
  };

  $scope.goToFirstPage = function () {
    $scope.currentPage = 1;
    $scope.getPlayers();
  };

  $scope.goToLastPage = function () {
    $scope.currentPage = $scope.pageCount;
    $scope.getPlayers();
  };

  function init() {
    $scope.searchPlayers();
  }

  init();
};
