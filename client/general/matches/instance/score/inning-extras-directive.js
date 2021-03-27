module.exports = function(InningExtrasView) {
    console.log("Adding directive ptf-innings-extras");
    var link = function(scope, element, attr) { //jshint unused:false

        scope.$watch('extras', function(newVal, oldVal) {
            console.log('Extras changed for innings: ' + scope.inning.order);
            if (newVal.byes !== oldVal.byes || newVal.legbyes !== oldVal.legbyes) {
                scope.inning.extrasChange();
            }
        }, true);

    };
    return {
        restrict: 'A',
        scope: {
            'inning': '=',
            'extras': '='
        },
        template: InningExtrasView,
        link: link
    };
};