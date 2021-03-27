'use strict';
module.exports = function(TeamsListItemView) {
    console.log("Adding directive ptf-team-list");
    function link(scope, element, attr) { //jshint unused: false
        var setActive = function(active) {
            var tstatus = element.find('#tstatus');
            if (active) {
                tstatus.addClass('status status-ongoing');
                tstatus.html('Active');
            } else {
                tstatus.addClass('status status-abandoned');
                tstatus.html('Inactive');
            }
        };
        setActive(scope.team.active);
    }

    return {
        restrict: 'A',
        scope: {
            'team': '=',
            'toggleActive': '&',
            'edit': '&onEdit'

        },
        template: TeamsListItemView,
        link: link
    };
};

