'use strict';
var moduleName = 'dcl.players';

var app = angular.module(moduleName, [
  'ui.router',
  require('../../common'),
  require('../../resources')
]);


app.controller('GenPlayersCtrl', require('./gen-players-ctrl.js'));
app.constant('GenPlayersView', require('./gen-players.html'));
app.constant('GenPlayersListView', require('./gen-players-list.html'));
app.constant('GenPlayersDetailsListView', require('./gen-players-details-list.html'));
app.constant('GenPlayersCardListView', require('./gen-players-card-list.html'));
app.constant('GenPlayersProfileView', require('./gen-players-profile.html'));
app.controller('PlayerProfileCtrl', require('./gen-player-profile-ctrl.js'));
app.constant('EditPlayerProfileView', require('./edit-player-profile.html'));
app.controller('EditPlayerProfileCtrl', require('./edit-player-profile-ctrl.js'));
app.constant('EditPlayerSettingsView', require('./edit-player-settings.html'));
app.controller('EditPlayerSettingsCtrl', require('./edit-player-settings-ctrl.js'));

app.config(require('./route.js'));

module.exports = moduleName;
