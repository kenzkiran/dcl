'use strict';
var moduleName = 'dcl.registrations';

var app = angular.module(moduleName, [
    'ui.router',
    require('../../common'),
    require('../../resources')
]);


app.controller('TeamRegistrationCtrl', require('./team-registration-ctrl.js'));
app.constant('TeamRegistrationView', require('./team-registration.html'));
app.config(require('./route.js'));

module.exports = moduleName;
