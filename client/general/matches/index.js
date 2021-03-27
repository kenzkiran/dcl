var moduleName = 'dcl.matches';

var app = angular.module(moduleName, [
    'ui.router',
    require('../../common'),
    require('../../resources')
]);


app.constant('MatchesListView', require('./matches-list.html'));

app.constant('BattingScoreView', require('./instance/score/batting-score-view.html'));
app.directive('ptfBattingScore', require('./instance/score/batting-score-directive.js'));

app.constant('BowlingScoreView', require('./instance/score/bowling-score-view.html'));
app.directive('ptfBowlingScore', require('./instance/score/bowling-score-directive.js'));

app.constant('InningExtrasView', require('./instance/score/inning-extras-view.html'));
app.directive('ptfInningExtras', require('./instance/score/inning-extras-directive.js'));


app.constant('InningBattingEditorView', require('./instance/score/inning-batting-editor-view.html'));
app.directive('ptfInningBattingEditor', require('./instance/score/inning-batting-editor-directive.js'));

app.constant('InningBowlingEditorView', require('./instance/score/inning-bowling-editor-view.html'));
app.directive('ptfInningBowlingEditor', require('./instance/score/inning-bowling-editor-directive.js'));

app.constant('InningHeaderView', require('./instance/score/inning-header-view.html'));
app.directive('ptfInningHeader', require('./instance/score/inning-header-directive.js'));

app.constant('MatchStatusView', require('./instance/score/match-status-view.html'));
app.directive('ptfMatchStatus', require('./instance/score/match-status-directive.js'));

app.constant('ScoreSheetEditableView', require('./instance/scoresheet-editable.html'));
app.directive('ptfScoreSheetEditable', require('./instance/scoresheet-editable-directive.js'));

app.constant('MatchInstanceEdit', require('./instance/match.instance.edit.html'));
app.controller('MatchInstanceCtrl', require('./instance/match-instance-ctrl.js'));

app.constant('MatchInstanceView', require('./instance/match.instance.view.html'));
app.controller('MatchInstanceViewCtrl', require('./instance/match-instance-view-ctrl.js'));

app.constant('InningView', require('./instance/score/inning-view.html'));
app.directive('ptfInningView', require('./instance/score/inning-view-directive.js'));

app.factory('InningScore', require('./instance/score/inning-score.js'));
app.factory('ScoreVerifier', require('./instance/score/score-verifier.js'));
app.factory('MatchScore', require('./instance/score/match-score.js'));

app.config(require('./route.js'));

module.exports = moduleName;
