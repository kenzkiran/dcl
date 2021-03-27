'use strict';
module.exports = function($stateProvider, GenAnnouncementsListView, GenAnnouncementInstanceView) {
    $stateProvider
        .state('announcements', {
            abstract: true,
            url: "/announcements",
            template: '<div class="container"><div ui-view> Put your content here </div></div>'
        })
        .state('announcements.list', {
            url: "",
            template: GenAnnouncementsListView,
            controller: 'GenAnnouncementsListCtrl'
        })
        .state('announcements.instance', {
            url: "/:id",
            template: GenAnnouncementInstanceView,
            controller: 'GenAnnouncementInstanceCtrl'
        });
};