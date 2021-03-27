'use strict';
module.exports = function($stateProvider, TeamRegistrationView) {
    $stateProvider
        .state('registrations', {
            abstract: true,
            url: "/registrations",
            template: '<div class="container"><div ui-view> Put your content here </div></div>'
        })
        .state('registrations.team', {
            url: "/:id",
            template: TeamRegistrationView,
            controller: 'TeamRegistrationCtrl'
        });
};