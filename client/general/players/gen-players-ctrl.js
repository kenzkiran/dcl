module.exports = function ($scope, $state, Player, DclCommon) {
    console.log('General Player List Controller');

    $scope.links = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    $scope.players = [];
    $scope.searchText = '';
    $scope.active = '1';
    $scope.certified = '0';
    $scope.viewMode = 0; // 0 - list view, 1 - card view

    $scope.pageSize = DclCommon.PlayersPageSize;
    $scope.currentPage = 1;
    $scope.pageCount = 0;

    $scope.SwitchViewMode = function() {
        $scope.viewMode = ($scope.viewMode === 0) ? 1 : 0;

        if ($scope.viewMode === 0) {
            $state.go('players.list.details');
        } else {
            $state.go('players.list.card');
        }
    };

    $scope.getPlayersByNameStartingWith = function(nameStartingWith) {
        $scope.searchText = nameStartingWith;
        $scope.active = '1';
        $scope.certified = '0';
        $scope.searchPlayers();
    };

    $scope.searchPlayers = function() {
        var totalPlayerCount = 0;
        var whereFilter = $scope.getWhereFilter();

        Player.getTotalCount(whereFilter).then(function(data) {
            totalPlayerCount = data.count;
            $scope.pageCount = Math.floor(totalPlayerCount / $scope.pageSize);

            if ((totalPlayerCount % $scope.pageSize) > 0) {
                $scope.pageCount = $scope.pageCount + 1;
            }
        });

        $scope.currentPage = 1;
        $scope.getPlayers();
    };

    $scope.getWhereFilter = function() {
        var whereFilter;

        if (($scope.searchText !== null && $scope.searchText !== undefined && $scope.searchText.length > 0) ||
            $scope.active !== '0' || $scope.certified !== '0') {
            whereFilter = {};
        }

        if ($scope.searchText !== null && $scope.searchText !== undefined && $scope.searchText.length > 0) {
            var regExp = '^' + $scope.searchText;
            whereFilter.firstName =  {like: regExp, options: 'i'};
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


    $scope.getPlayers = function() {
        var filter = {};

        var whereFilter = $scope.getWhereFilter();

        if (whereFilter !== null && whereFilter !== undefined) {
            filter.where = whereFilter;
        }

        filter.order = 'firstName ASC';
        filter.skip = ($scope.currentPage - 1) * $scope.pageSize;
        filter.limit =  $scope.pageSize;

        Player.getPlayersByFilter(filter).then(function(players) {
            $scope.players = players;
        });
    };

    $scope.goToPlayerList = function() {
        if ($scope.viewMode === 0) {
            $state.go('players.list.details');
        } else {
            $state.go('players.list.card');
        }
    };

    $scope.goToNextPage = function() {
        $scope.currentPage = $scope.currentPage + 1;
        $scope.getPlayers();
    };

    $scope.goToPreviousPage = function() {
        $scope.currentPage = $scope.currentPage - 1;
        $scope.getPlayers();
    };

    $scope.goToFirstPage = function() {
        $scope.currentPage = 1;
        $scope.getPlayers();
    };

    $scope.goToLastPage = function() {
        $scope.currentPage = $scope.pageCount;
        $scope.getPlayers();
    };

    function init() {
        $scope.searchPlayers();
    }

    init();
};
