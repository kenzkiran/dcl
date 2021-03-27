module.exports = function ($scope, Ground, GroundAddModal, GroundViewMap, ModalService) {
    console.log('Grounds List Controller');

    $scope.grounds = [];
    var getGrounds = function () {
        Ground.getGrounds().then(function (grounds) {
            $scope.grounds = grounds;
        });
    };

    var addGround = function (newGround) {

        Ground.upsertGround(newGround).then(function () {
            getGrounds();
        });
    };

    $scope.add = function (ground) {
        var info = {ground: ground};
        var modalInstance = ModalService.addModal(GroundAddModal, 'GroundAddInstanceCtrl', info);

        modalInstance.result.then(function (ground) {
            console.log("New Ground" + JSON.stringify(ground));
            addGround(ground);
        }, function () {
            console.log("Modal dismissed");
        });
    };

    $scope.viewMap = function (ground) {
        var info = {ground: ground};
        ModalService.addModal(GroundViewMap, 'GroundViewMapCtrl', info);
    };

    $scope.getDisplayAddress = function (ground) {
        var address = ground.address || (ground.city || '');
        /*if (ground.address) {
            address = ground.address;
        }
        if (ground.city) {
            if (address.length > 0) {
                address = address + ', ';
            }
            address = address + ground.city;
        }*/
        return address;
    };

    $scope.toggleActive = function(ground) {
        ground.active = !ground.active;
        Ground.upsertGround(ground).then(function() {
            getGrounds();
        });
    };

    getGrounds();
};
