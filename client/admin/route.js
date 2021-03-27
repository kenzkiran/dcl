'use strict';
module.exports = function($stateProvider, AdminView) {
    $stateProvider
        .state('admin', {
            abstract: true,
            url: "/admin",
            template: AdminView
        });
};
