'use strict';
var moduleName = 'dcl.tournaments';

var app = angular.module(moduleName, [
    'ui.router',
    require('../../common'),
    require('../../resources')
]);

app.constant('GenTournamentInstanceView', require('./instance/tournament.instance.html'));
app.constant('GenTournamentInstanceMatchView', require('./instance/tournament.instance.match.html'));
app.constant('GenTournamentInstanceStatView', require('./instance/tournament.instance.stat.html'));
app.constant('GenTournamentInstanceStandingsView', require('./instance/tournament.instance.standings.html'));
app.constant('GenTournamentsListView', require('./tournaments-list.html'));
app.controller('GenTournamentsListCtrl', require('./tournaments-ctrl.js'));

// Tournament Instance has 3 controllers:
// 1. Generic Tournament details
// 2. Tournament Matches
// 3. Tournament Stats
app.controller('GenTournamentInstanceCtrl', require('./instance/tournament-instance-ctrl.js'));
app.controller('GenTournamentInstanceMatchCtrl', require('./instance/tournament-instance-match-ctrl.js'));
app.controller('GenTournamentInstanceStatCtrl', require('./instance/tournament-instance-stat-ctrl.js'));
app.controller('GenTournamentInstanceStandingsCtrl', require('./instance/tournament-instance-standings-ctrl.js'));
app.config(require('./route.js'));

module.exports = moduleName;
