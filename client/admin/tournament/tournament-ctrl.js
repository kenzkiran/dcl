module.exports = function($scope, $log, Tournament, Division, TournamentAddModal, ModalService) {
    $scope.tournaments = [];

    var getTournaments = function() {
        Tournament.getTournaments().then(function(tourneys) {
            $scope.tournaments = tourneys;
        });
    };

    var addTourney = function(newTourney) {
        Tournament.upsertTournament(newTourney).then(function() {
            getTournaments();
        });
    };

    $scope.add = function(tournament) {
        var info = {tournament: tournament};
        var modalInstance = ModalService.addModal(TournamentAddModal, 'TournamentAddInstanceCtrl', info);
        modalInstance.result.then(function(newTourney) {
            $log.info("New Tournament" + JSON.stringify(newTourney));
            addTourney(newTourney);
        }, function() {
            $log.debug("Modal dismissed");
        });
    };

    function init() {
        $log.info("Tournaments List Controller");
        getTournaments();
    }

    // Begin Execution here
    init();
};
