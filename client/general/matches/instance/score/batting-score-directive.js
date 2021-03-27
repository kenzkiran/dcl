module.exports = function($log, BattingScoreView) {
    console.log("Adding directive ptf-batting-score");

    var link = function(scope, element, attrs) { //jshint unused:false
        var bs = scope.battingScore;
        bs.sequence = scope.index + 1;
        scope.fielderEnabled = false;
        scope.bowlerEnabled = false;
        scope.battingOptions = function(index) {
            return scope.inning.getAvailableBatsman(index);
        };

        var handleStatusChange = function() {
            console.log('bs status changed: ' + bs.status);
            scope.fielderEnabled = (bs.status === 'caught' || bs.status === 'runout' || bs.status === 'stumped');
            scope.bowlerEnabled = (bs.status === 'bowled' || bs.status === 'caught' || bs.status === 'stumped' ||
            bs.status === 'lbw' || bs.status === 'hitwk');
        };

        var handleRunsChange = function() {
            //console.log('battingScore runs changed: ' + bs.runs);
            scope.inning.runsChange();
        };

        var handleBowlerChange = function() {
            //console.log('battingScore bowler changed: ' + bs.runs);
            scope.inning.bowlerChange();
        };

        scope.$watch('battingScore', function(newVal, oldVal) {
            //console.log('battingScore changed: ' + scope.index);
            scope.$emit('match:resetVerify', {});
            if (newVal.batsman && newVal.batsman.name === '') {
                newVal.runs = 0;
                newVal.balls = 0;
                newVal.four = 0;
                newVal.six = 0;
                newVal.status = scope.inning.status[0];
                newVal.bowler = {name: ''};
                newVal.fielder = {name: ''};
            }
            if (newVal.status !== oldVal.status) {
                handleStatusChange();
            }
            if (newVal.runs !== oldVal.runs) {
                handleRunsChange();
            }
            if (newVal.bowler.id !== oldVal.bowler.id) {
                handleBowlerChange();
            }
        }, true);

        handleStatusChange();
        handleRunsChange();
    };

    return {
        restrict: 'A',
        scope: {
            'battingScore': '=',
            'index': '=',
            'inning': '='
        },
        template: BattingScoreView,
        link: link
    };
};

