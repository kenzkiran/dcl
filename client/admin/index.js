var moduleName = 'dcl.admin';

var app = angular.module(moduleName, ['ui.router']);
app.constant('AdminView', require('./admin.html'));
app.config(require('./route.js'));

module.exports = moduleName;
