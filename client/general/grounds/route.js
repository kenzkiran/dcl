'use strict';
module.exports = function($stateProvider, GenGroundListView) {
    $stateProvider
        .state('grounds', {
            abstract: true,
            url: "/grounds",
            template: '<div class="container"><div ui-view> Put your content here </div></div>'
        })
        .state('grounds.list', {
            url: "/:id",
            template: GenGroundListView,
            controller: 'GenGroundListCtrl'
        });
};