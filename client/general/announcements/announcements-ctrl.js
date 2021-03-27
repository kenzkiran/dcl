'use strict';
module.exports = function($scope, Announcements) {
    $scope.announcements = [];
    $scope.showLoading=true;
    console.log('Viewers Announcements Controller');
    var getAnnouncements = function() {
        Announcements.get().then(function(data) {
            $scope.announcements = data;
            $scope.showLoading=false;
        });
    };
    // Controller execution starts below
    console.log('General Announcement Ctrl');
    //for data to appear on initial page load
    getAnnouncements();
};