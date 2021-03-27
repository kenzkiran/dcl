'use strict';
var moduleName = 'dcl.common';

var dclCommon = angular.module(moduleName, []);

dclCommon.factory('ModalService', require('./modal-service'));
dclCommon.service('highlight', require('./highlight'));
dclCommon.service('Utils', require('./utils-service'));
dclCommon.filter('ptfOrder', require('./ptf-order-filter'));

dclCommon.filter('ptfExcludeItems', require('./ptf-exclude-filter'));
dclCommon.filter('ptfSearchMatch', require('./ptf-searchmatch-filter'));

module.exports = moduleName;
