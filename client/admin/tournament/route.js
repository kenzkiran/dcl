module.exports = function($stateProvider, TournamentMainView, TournamentListView, TournamentInstanceView) {
    console.log('Admin Tournament Config');
    $stateProvider
        .state('admin.tournament', {
            abstract: true,
            url: "/tournament",
            template: TournamentMainView
        })
        .state('admin.tournament.list', {
            url: "",
            template: TournamentListView,
            controller: 'TournamentListCtrl'
        })
        .state('admin.tournament.instance', {
            url: "/:id",
            template: TournamentInstanceView,
            controller: 'TournamentInstanceCtrl'
        });
};
