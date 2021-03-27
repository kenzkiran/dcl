'use strict';
module.exports = function($stateProvider, GenPlayersView, GenPlayersListView, GenPlayersDetailsListView, 
    GenPlayersCardListView, GenPlayersProfileView, EditPlayerProfileView, EditPlayerSettingsView) {
    $stateProvider
        .state('players', {
            abstract: true,
            url: "/players",
            template: GenPlayersView,
            controller: 'GenPlayersCtrl'
        })
        .state('players.editsettings', {
            url: "/settings",
            template: EditPlayerSettingsView,
            controller: 'EditPlayerSettingsCtrl'
        })
        .state('players.list', {
            abstract: true,
            url: "/list",
            template: GenPlayersListView
        })
        .state('players.list.details', {
            url: "/details",
            template: GenPlayersDetailsListView
        })
        .state('players.list.card', {
            url: "/card",
            template: GenPlayersCardListView
        })
        .state('players.instance', {
            url: "/:id",
            template: GenPlayersProfileView,
            controller: 'PlayerProfileCtrl'
        })
        .state('players.editprofile', {
          url: "/:id/edit",
          template: EditPlayerProfileView,
          controller: 'EditPlayerProfileCtrl'
        });

};