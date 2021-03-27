'use strict';
module.exports = function($stateProvider, TeamsListView, TeamsInstanceView) {
    console.log("Route: Teams");

    $stateProvider
        .state('admin.teams', {
            abstract: true,
            url: "/teams",
            template: '<div class="container"><div ui-view> Put your content here </div></div>'
        })
        .state('admin.teams.list', {
            url: "",
            template: TeamsListView,
            controller: 'TeamsListCtrl'
        })
        .state('admin.teams.instance', {
            url: "/:id",
            template: TeamsInstanceView,
            controller: 'TeamInstanceCtrl'
        });
};
