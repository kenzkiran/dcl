'use strict';
module.exports = function($stateProvider, GenTeamsListView, GenTeamsInstanceView, TeamsAddPlayerView) {
    $stateProvider
        .state('teams', {
            abstract: true,
            url: "/teams",
            template: '<div class="container"><div ui-view> Put your content here </div></div>'
        })
        .state('teams.list', {
            url: "",
            template: GenTeamsListView,
            controller: 'GenTeamsListCtrl'
        })
        .state('teams.instance', {
            url: "/:id",
            template: GenTeamsInstanceView,
            controller: 'GenTeamsInstanceCtrl'
        })
        .state('teams.addPlayer', {
            url: "/addPlayer/:id",
            template: TeamsAddPlayerView,
            controller: 'TeamsAddPlayerCtrl'
        });
};