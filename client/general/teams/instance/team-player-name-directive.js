module.exports = function(TeamPlayerNameView) {
    console.log("Adding directive team-player-name");
    return {
        restrict: 'E',
        scope: {
            'fname': '=firstName',
            'lname': '=lastName',
            'role': '=',
            'isCaptain': '&',
            'isVice': '&',
            'isAdmin':  '&'
        },
        template: TeamPlayerNameView
    };
};