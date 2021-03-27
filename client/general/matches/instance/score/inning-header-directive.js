module.exports = function(InningHeaderView) {
    //console.log("Adding directive ptf-innings-header");
    function link(scope, element, attr) { //jshint unused:false
        scope.numPlayersChange = function() {
            scope.inning.numPlayersChange();
        };
    }

    return {
        restrict: 'A',
        scope: {
            'inning': '='
        },
        template: InningHeaderView,
        link: link
    };
};