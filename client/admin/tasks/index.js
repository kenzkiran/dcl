'use strict';
var moduleName = 'dcl.tasks';

var app = angular.module(moduleName, [
    'ui.router',
    require('../../common'),
    require('../../resources')
]);

/* All views are loaded as constants */
app.constant('TasksListView', require('./tasks-list.html'));
app.controller('TasksListCtrl', require('./tasks-list-ctrl.js'));

app.controller('TaskReasonCtrl', require('./task-reason-ctrl.js'));
app.constant('TaskReasonModal', require('./task-reason-modal.html'));

app.config(require('./route.js'));

module.exports = moduleName;
