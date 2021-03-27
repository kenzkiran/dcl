module.exports = function($log, InningView) {
    console.log("Adding directive ptf-inning-view");
    var link = function(scope, elem, attr) { //jshint unused: false
        scope.extras = undefined;
        scope.panelOpen = true;

        function getBowlerExtras() {
            var extras = {wides: 0, noballs: 0};
            var bs = scope.inning.bowlingScores;
            bs.forEach(function (bowlerScore) {
                extras.wides += bowlerScore.wides;
                extras.noballs += bowlerScore.noballs;
            });
            return extras;
        }

        function calcExtras() {
            var extras = getBowlerExtras();
            extras.legbyes = scope.inning.legByes;
            extras.byes = scope.inning.byes;

            if (extras.wides < scope.inning.wides) {
                extras.wides = scope.inning.wides;
            }

            if (extras.noballs < scope.inning.nobes) {
                extras.noballs = scope.inning.nobes;
            }

            var extrasTotal = _.reduce(_.values(extras), function(memo, num){ return memo + num; }, 0);
            var extrasStr = extras.wides + ' W, ' + extras.noballs + ' NB, ' + extras.byes + ' B, ' + extras.legbyes + ' LB ';
            //$log.info('calcExtras: ', extrasStr, extrasTotal);
            return {
                extrasStr: extrasStr,
                total: extrasTotal
            };
        }


        scope.getFielder = function(bs) {
            if (bs.fielder && bs.fielder !== '') {
                return bs.fielder.firstName + ' ' + bs.fielder.lastName;
            }
            return '';
        };

        scope.getBowler = function(bs) {
            if (bs.bowler && bs.bowler !== '') {
                return bs.bowler.firstName + ' ' + bs.bowler.lastName;
            }
            return '';
        };

        scope.getStrikeRate = function(bs) {
            if (bs.balls > 0 ) {
                return (bs.runs/bs.balls * 100).toFixed(2) + ' %';
            }
            return '0.00 %';
        };

        if (!scope.extras) {
            scope.extras = calcExtras();
        }
    };
    return {
        restrict: 'A',
        scope: {
            'inning': '='
        },
        template: InningView,
        link: link
    };
};
