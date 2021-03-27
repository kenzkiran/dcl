'use strict';
module.exports = function($stateProvider, GenTournamentsListView, GenTournamentInstanceView, GenTournamentInstanceMatchView,
                          GenTournamentInstanceStatView, GenTournamentInstanceStandingsView) {
    $stateProvider
        .state('tournaments', {
            abstract: true,
            url: "/tournaments",
            template: '<div class="container"><div ui-view> Put your content here </div></div>'
        })
        .state('tournaments.list', {
            url: "",
            template: GenTournamentsListView,
            controller: 'GenTournamentsListCtrl'
        })
        .state('tournaments.instance', {
            url: "/:id",
            abstract: true,
            template: GenTournamentInstanceView,
            controller: 'GenTournamentInstanceCtrl'
        })
        .state('tournaments.instance.matches', {
            url: "",
            template: GenTournamentInstanceMatchView,
            controller: 'GenTournamentInstanceMatchCtrl'
        })
        .state('tournaments.instance.stats', {
            url: "/stats",
            template: GenTournamentInstanceStatView,
             controller: 'GenTournamentInstanceStatCtrl'
        })
        .state('tournaments.instance.standings', {
            url: "/standings",
            template: GenTournamentInstanceStandingsView,
            controller: 'GenTournamentInstanceStandingsCtrl'
        });
};