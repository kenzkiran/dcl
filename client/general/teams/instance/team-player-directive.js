module.exports = function(TeamPlayerView) {
    console.log("Adding directive ptf-team-player");
    return {
        restrict: 'A',
        scope: {
            'player': '=',
            'edit': '&onEdit',
            'isCaptain': '&',
            'isVice': '&',
            'isAdmin': '&'
        },
        template: TeamPlayerView
    };
};