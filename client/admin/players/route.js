'use strict';
module.exports = function ($stateProvider, AdminPlayersView, AdminPlayersListView, AdminPlayersDetailsListView) {
  $stateProvider
    .state('admin.players', {
      abstract: true,
      url: "/players",
      template: AdminPlayersView,
      controller: 'AdminPlayersCtrl'
    })
    .state('admin.players.list', {
      abstract: true,
      url: "/list",
      template: AdminPlayersListView
    })
    .state('admin.players.list.details', {
      url: "/details",
      template: AdminPlayersDetailsListView
    });
};