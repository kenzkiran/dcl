'use strict';
var moduleName = 'dcl.admin.teams';

var app = angular.module(moduleName, [
    'ui.router',
    require('../../common'),
    require('../../resources')
]);


app.constant('TeamsListView', require('./teams.list.view.html'));
app.constant('TeamsInstanceView', require('./instance/teams.instance.html'));
app.constant('TeamsListItemView', require('./teams-list-item-view.html'));
app.constant('TeamAddModal', require('./team-add-modal.html'));

app.controller('TeamsListCtrl', require('./teams-ctrl.js'));
app.controller('TeamAddInstanceCtrl', require('./team-add-instance-ctrl.js'));
app.controller('TeamInstanceCtrl', require('./instance/team-instance-ctrl.js'));

app.directive('ptfTeamList', require('./teams-list-directive.js'));

app.config(require('./route.js'));

module.exports = moduleName;
