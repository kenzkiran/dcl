var ConfirmModalInstanceCtrl = function($rootScope, $modalInstance, info) {
    $rootScope.confirmMsg = info.message || 'Are you sure ?';
    $rootScope.yes = function() {
        $modalInstance.close();
        info.yesFunc();
    };
    $rootScope.no = function() {
        $modalInstance.dismiss('cancel');
        info.noFunc();
    };
};

var LoadingModalInstanceCtrl = function($rootScope, $modalInstance, info) {
    $rootScope.confirmMsg = info.message || 'Waiting for operation';
    $rootScope.cancel = function() {
        $modalInstance.dismiss('cancel');
        info.cancelFunc();
    };

};

//dclApp.factory('ModalService', ['$templateCache', '$modal', function($templateCache, $modal) {
module.exports = function($templateCache, $modal) {
    var confirmModalHtml = '<div style="background-color: #d2322d;" class="modal-header"> <h3 style="color: #ffffff;" class="modal-title">Confirm</h3> </div>' +
        '<div class="modal-body"><h3> {{confirmMsg}} </h3></div>' +
        '<div class="modal-footer"><button class="btn btn-danger" ng-click="yes()">YES</button><button class="btn btn-info" ng-click="no()">NO</button></div>';

    var loadingModalHtml = '<div style="background-color: #31B0D5;" class="modal-header"> <h4 style="color: #ffffff;" class="modal-title">Confirm</h4> </div>' +
        '<div class="modal-body"><h4> {{confirmMsg}}  <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"> </span> </h4></div>' +
        '<div class="modal-footer"><button class="btn btn-warning" ng-click="cancel()"> Cancel </button></div>';

    return {
        addModal: function(template, instanceController, info, size) {
            var modalInstance = $modal.open({
                animation: true,
                template: template,
                controller: instanceController,
                size: size || 'md', //default 'md' medium, could be 'sm' for small
                resolve: {
                    info: function() {
                        return info;
                    }
                }
            });
            return modalInstance;
        },
        confirmModal: function(message, yesFunc, noFunc) {
            var funcs = {
                message: message,
                yesFunc: yesFunc,
                noFunc: noFunc
            };
            var modalInstance = this.addModal(confirmModalHtml, ConfirmModalInstanceCtrl, funcs, 'md');
            return modalInstance;
        },
        loadingModal: function(message, cancelFunc, maxWait) { //jshint unused:false
            var funcs = {
                message: message,
                cancelFunc: cancelFunc
            };
            var modalInstance = this.addModal(loadingModalHtml, LoadingModalInstanceCtrl, funcs, 'sm');
            return modalInstance;
        }
    };
};