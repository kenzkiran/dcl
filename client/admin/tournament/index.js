'use strict';
var moduleName = 'dcl.admin.tournament';

var app = angular.module(moduleName, [
    'ui.router',
    require('../../common'),
    require('../../resources')
]);

/* All views are loaded as constants */
app.constant('TournamentListItemView', require('./tournament-list-item-view.html'));
app.constant('TournamentAddModal', require('./tournament-add-modal.html'));
app.constant('TournamentMainView', require('./tournament.html'));
app.constant('TournamentInstanceView', require('./instance/tournament.instance.html'));
app.constant('TournamentListView', require('./tournament.list.html'));

app.constant('TournamentAddModal', require('./tournament-add-modal.html'));
app.constant('TournamentAddMatchModal' ,require('./instance/tournament-add-match-modal.html'));
app.constant('TournamentPenaltyModal' ,require('./instance/tournament-penalty-modal.html'));

app.constant('TournamentAddMatchModal', require('./instance/tournament-add-match-modal.html'));
app.constant('TournamentMatchListView', require('./instance/tournament-match-list-view.html'));
app.constant('TournamentAddTeamModal', require('./instance/tournament-add-team-modal.html'));


app.controller('TournamentListCtrl', require('./tournament-ctrl.js'));
app.controller('TournamentAddInstanceCtrl', require('./tournament-add-instance-ctrl.js'));
app.controller('TournamentInstanceCtrl', require('./instance/tournament-instance-ctrl.js'));
app.controller('TournamentAddMatchInstanceCtrl', require('./instance/tournament-add-match-instance-ctrl.js'));
app.controller('TournamentAddTeamCtrl', require('./instance/tournament-add-team-ctrl.js'));
app.controller('TournamentPenaltyCtrl', require('./instance/tournament-penalty-ctrl.js'));


app.directive('ptfTournamentList', require('./tournament-list-directive.js'));
app.directive('ptfMatchList', require('./instance/tournament-match-list-directive.js'));

app.config(require('./route.js'));

module.exports = moduleName;
