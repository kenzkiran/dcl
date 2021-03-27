'use strict';
var moduleName = 'dcl.grounds';

var app = angular.module(moduleName, [
    'ui.router',
    require('../../common'),
    require('../../resources')
]);


app.controller('GenGroundListCtrl', require('./gen-ground-list-ctrl.js'));
app.constant('GenGroundListView', require('./gen-ground-list.html'));
app.config(require('./route.js'));

module.exports = moduleName;
