'use strict';
var moduleName = 'dcl.admin.players';

var app = angular.module(moduleName, [
    'ui.router',
    require('../../common'),
    require('../../resources')
]);



app.constant('AdminPlayerInstanceModal' ,require('./admin-player-instance-modal.html'));
app.controller('AdminPlayerInstanceCtrl', require('./admin-player-instance-ctrl.js'));
app.controller('AdminPlayersCtrl', require('./admin-players-ctrl.js'));
app.constant('AdminPlayersView', require('./admin-players.html'));
app.constant('AdminPlayersListView', require('./admin-players-list.html'));
app.constant('AdminPlayersDetailsListView', require('./admin-players-details-list.html'));
app.config(require('./route.js'));

module.exports = moduleName;
