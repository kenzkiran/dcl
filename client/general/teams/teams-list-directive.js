'use strict';
module.exports = function(GenTeamsListItemView) {
    console.log("Adding directive ptf-general-team-list");

    return {
        restrict: 'A',
        scope: {
            'team': '=',
            'postfix': '='
        },
        template: GenTeamsListItemView
    };
};
