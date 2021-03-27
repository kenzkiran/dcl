module.exports = function(BowlingScoreView) {
    console.log("Adding directive ptf-bowling-score");
    var link = function(scope, element, attr) { //jshint unused:false
        scope.$watch('bowlingScore', function(newVal, oldVal) {
            //console.log('bowlingScore changed: ' + JSON.stringify(newVal));
            scope.$emit('match:resetVerify', {});
            if (newVal.bowler && newVal.bowler.name === '') {
                newVal.wides = 0;
                newVal.noballs = 0;
                newVal.runs = 0;
                newVal.maidens = 0;
                newVal.overs = 0;
                newVal.balls = 0;
                newVal.wickets = 0;
            }
            if (newVal.wides !== oldVal.wides || newVal.noballs !== oldVal.noballs) {
                scope.inning.bowlerExtrasChange();
            }

            if (newVal.overs !== oldVal.overs || newVal.balls !== oldVal.balls) {
                scope.inning.bowlerOversChange();
            }
        }, true);

    };
    return {
        restrict: 'A',
        scope: {
            'bowlingScore': '=',
            'index': '=',
            'inning': '='
        },
        template: BowlingScoreView,
        link: link
    };
};

