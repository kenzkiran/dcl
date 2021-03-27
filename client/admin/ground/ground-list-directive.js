'use strict';

module.exports = function(GroundListItemView) {
    console.log("Adding directive ptf-ground-list");

    function link(scope, element, attr) { //jshint unused: false
        var setActive = function(active) {
            var gstatus = element.find('#gstatus');
            if (active) {
                gstatus.addClass('status status-ongoing');
                gstatus.html('Active');
            } else {
                gstatus.addClass('status status-abandoned');
                gstatus.html('Inactive');
            }
        };
        setActive(scope.ground.active);
    }

    return {
        restrict: 'A',
        scope: {
            'ground': '=',
            'edit': '&onEdit',
            'viewMap': '&onViewMap',
            'getDisplayAddress': '&getDisplayAddress',
            'toggleActive': '&onToggleActive'
        },
        template: GroundListItemView,
        link: link
    };
};

