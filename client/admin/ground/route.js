module.exports = function ($stateProvider, GroundMainView, GroundListView, GroundInstanceView) {
    console.log('Ground');
    $stateProvider
        .state('admin.ground', {
            abstract: true,
            url: "/ground",
            template: GroundMainView
        })
        .state('admin.ground.list', {
            url: "",
            template: GroundListView,
            controller: 'GroundListCtrl'
        })
        .state('admin.ground.instance', {
            url: "/:id",
            template: GroundInstanceView,
            controller: 'GroundInstanceCtrl'
        });
};
