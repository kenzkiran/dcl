module.exports = function($log, MatchStatusView) {
    function link(scope, element, attr) { //jshint unused:false
        console.log('MatchStatusView');
        scope.status = scope.match.status;
        scope.winner = scope.match.getWinningTeam();
        scope.mom = scope.match.getManOfMatch();
        if (scope.mom) {
            scope.mom = JSON.stringify(scope.mom);
        }
        scope.showWinner = false;
        //$log.info('Status Directive:', scope.status, scope.winner, scope.mom);
        scope.$watch('status', function(newVal, oldVal) { //jshint unused:false
            scope.match.status = newVal;
            scope.showWinner = (newVal === 'Won') ? true : false;
            scope.$emit('match:resetVerify', {});
        }, true);

        scope.$watch('winner', function(newVal, oldVal) { //jshint unused:false
            scope.match.winTeamId = scope.winner ? scope.winner.id: undefined;
            $log.info("Match winner changed:", scope.winner);
            scope.$emit('match:resetVerify', {});
        }, true);

        scope.$watch('mom', function(newVal, oldVal) { //jshint unused:false
            $log.info("MoM changed:", scope.mom);
            if (scope.mom) {
                // strange thing here, because the options on the view
                // is mixed with simple text options
                scope.match.momId =  JSON.parse(scope.mom).id;
            }
        }, true);
    }

    return {
        restrict: 'A',
        scope: {
            'match': '='
        },
        template: MatchStatusView,
        link: link
    };
};