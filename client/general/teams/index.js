'use strict';
var moduleName = 'dcl.teams';

var app = angular.module(moduleName, [
    'ui.router',
    require('../../common'),
    require('../../resources')
]);

app.constant('GenTeamsListView', require('./teams-list-view.html'));
app.constant('GenTeamsInstanceView', require('./instance/team.instance.html'));
app.constant('GenTeamsListItemView', require('./teams-list-item-view.html'));
app.constant('TeamsAddPlayerView', require('./instance/teams-add-player-view.html'));
app.constant('TeamPlayerView', require('./instance/team-player-view.html'));
app.constant('TeamPlayerAddRoleView', require('./instance/team-player-add-role-modal.html'));
app.constant('TeamPlayerNameView',require ('./instance/team-player-name-view.html'));

app.controller('TeamPlayerAddRoleCtrl', require('./instance/team-player-add-role-ctrl.js'));
app.controller('GenTeamsListCtrl', require('./teams-ctrl.js'));
app.controller('GenTeamsInstanceCtrl', require('./instance/teams-instance-ctrl.js'));
app.controller('TeamsAddPlayerCtrl', require('./instance/teams-add-player-ctrl.js'));

app.directive('ptfGeneralTeamList', require('./teams-list-directive.js'));
app.directive('ptfTeamPlayer', require('./instance/team-player-directive.js'));
app.directive('ptfTeamPlayerName', require('./instance/team-player-name-directive.js'));

app.config(require('./route.js'));

module.exports = moduleName;
