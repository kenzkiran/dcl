module.exports = function($scope, $stateParams, ModalService, Match, Tournament, TournamentAddTeamModal,
                          TournamentAddMatchModal, TournamentPenaltyModal, Ground, Team, highlight) {
    $scope.id = $stateParams.id;
    $scope.matches = [];
    $scope.tournament = null;
    $scope.teams = [];
    $scope.grounds = [];
    $scope.searchText = '';
    $scope.tourneyTeams = [];

    $scope.highlight = function(text) {
        return highlight.highlightSearchedText($scope.searchText, text);
    };

    function getTournament() {
        Tournament.getTourney($scope.id).then(function(tourney) {
            $scope.tournament = tourney;
            $scope.tourneyTeams = tourney.teams;
        });
    }

    function getMatches(tournamentId) {
        Match.getTournamentMatches(tournamentId).then(function(matches) {
            $scope.matches = matches;
        });
    }

    function getTeams() {
        /* Retrieve only active teams for adding new matches */
        Team.getActiveTeams().then(function(data) {
            $scope.teams = data;
            console.log($scope.teams);
        });
    }

    function getGrounds() {
        Ground.getGrounds().then(function(grounds) {
            console.log(grounds);
            $scope.grounds = grounds;
        });
    }

    var addMatch = function(newMatch) {
        Match.upsertMatch($scope.tournament.id, newMatch).then(function() {
            getMatches($scope.id);
        });
    };

    $scope.add = function(match) {
        var info = {match: match, teams: $scope.teams, grounds: $scope.grounds};
        var modalInstance = ModalService.addModal(TournamentAddMatchModal, 'TournamentAddMatchInstanceCtrl', info);
        modalInstance.result.then(function(newMatch) {
            //console.log("New Match" + JSON.stringify(newMatch));
            addMatch(newMatch);
        }, function() {
            console.log("Modal dismissed");
        });
    };

    $scope.manageTeams = function() {
        var info = {tourney: $scope.tournament, allTeams: $scope.teams};
        var modalInstance = ModalService.addModal(TournamentAddTeamModal, 'TournamentAddTeamCtrl', info);
        modalInstance.result.then(function() {
           console.log("Done");
        }, function() {
            console.log("Modal dismissed");
        });
    };

    $scope.managePenalties = function() {
        var info = {tourney: $scope.tournament, allTeams: $scope.teams};
        var modalInstance = ModalService.addModal(TournamentPenaltyModal, 'TournamentPenaltyCtrl', info);
        modalInstance.result.then(function() {
            console.log("Done");
        }, function() {
            console.log("Modal dismissed");
        });
    };

    $scope.toggleLock = function(match) {
        console.log('Toggle lock: ' + match.id);
        match.lock = !match.lock;
        match.$update().then(function() {
            getMatches($scope.id);
        });
    };

    getGrounds();
    getTeams();
    getTournament();
    getMatches($scope.id);
};