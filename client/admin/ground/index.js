'use strict';
var moduleName = 'dcl.ground';

var app = angular.module(moduleName, [
    'ui.router',
    require('../../common'),
    require('../../resources')
]);

/* All views are loaded as constants */
app.constant('GroundMainView', require('./ground.html'));

app.controller('GroundListCtrl', require('./ground-list-ctrl.js'));
app.constant('GroundListView', require('./ground.list.html'));

app.constant('GroundListItemView', require('./ground-list-item-view.html'));
app.directive('ptfGroundList', require('./ground-list-directive.js'));

app.controller('GroundAddInstanceCtrl', require('./ground-add-instance-ctrl.js'));
app.constant('GroundAddModal', require('./ground-add-modal.html'));

app.constant('GroundInstanceView', require('./instance/ground.instance.html'));

app.controller('GroundViewMapCtrl', require('./ground-view-map-ctrl.js'));
app.constant('GroundViewMap', require('./ground-view-map.html'));

app.config(require('./route.js'));

module.exports = moduleName;
