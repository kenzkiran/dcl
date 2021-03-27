//var app = angular.module('dcl.admin.tournament');
//app.directive('ptfMatchList', function() {
module.exports = function(TournamentMatchListView) {
    console.log("Adding directive ptf-tournament-list");
    return {
        restrict: 'A',
        //transclude: true,
        scope: {
            'match': '=',
            'edit': '&onEdit',
            'toggleLock': '&',
            'highlight': '&'
        },
        template: TournamentMatchListView
    };
};

