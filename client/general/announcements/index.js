'use strict';
var moduleName = 'dcl.announcements';

var app = angular.module(moduleName, ['ui.router', require('../../common'), require('../../resources')
]);


app.constant('GenAnnouncementsListView', require('./announcements-list.html'));
app.constant('GenAnnouncementInstanceView', require('./announcement-instance-view.html'));
app.controller('GenAnnouncementsListCtrl', require('./announcements-ctrl.js'));
app.controller('GenAnnouncementInstanceCtrl', require('./announcement-instance-ctrl.js'));
app.config(require('./route.js'));
module.exports = moduleName;
