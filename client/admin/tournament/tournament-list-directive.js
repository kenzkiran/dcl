'use strict';
module.exports = function(TournamentListItemView) {
    console.log("Adding directive ptf-tournament-list");
    function link(scope, element /*, attr */) {
        var addStatus = function(t) {
            console.log('AddClass :' + t.status);
            var tstatus = element.find('#tstatus');
            if (t.status === 'ABANDONED') {
                tstatus.addClass('status status-abandoned');
            } else if (t.status === 'ONGOING') {
                tstatus.addClass('status status-ongoing');
            } else if (t.status === 'COMPLETED') {
                tstatus.addClass('status status-completed');
            }
        };
        addStatus(scope.tournament);
    }

    return {
        restrict: 'A',
        scope: {
            'tournament': '=',
            'edit': '&onEdit',
            'isadmin': '='
        },
        template: TournamentListItemView,
        link: link
    };
};

