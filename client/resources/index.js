var moduleName = 'dcl.resources';

var app = angular.module(moduleName, [
    'ngResource'
]);

app.value('DclCommon', require('./dcl-common-res.js'));
app.factory('Ground', require('./ground-res.js'));
app.factory('Match', require('./match-res.js'));
app.factory('Team', require('./team-res.js'));
app.factory('Division', require('./division-res.js'));
app.factory('Tournament', require('./tournament-res.js'));
app.factory('ScoreSheet', require('./scoresheet-res.js'));
app.factory('Player', require('./player-res.js'));
app.factory('Announcements', require('./announcements-res.js'));
app.factory('Tasks', require('./tasks-res.js'));

module.exports = moduleName;