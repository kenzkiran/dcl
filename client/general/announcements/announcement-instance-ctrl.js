module.exports = function($scope, $stateParams, Announcements, $log, $sce) 
{    
  console.log('Single Announcement Content controller');
   $scope.id = $stateParams.id;
   $scope.announcement = [];
    //function call to get the announcement details based on id from state
    var getAnnouncement = function() { 
        Announcements.get($scope.id).then(function(data) {
        $scope.announcement = data;
        });
    };
    //return a trusted html for ng-bind-html directive in view
    $scope.trustHtml = function(html){
        return $sce.trustAsHtml(html);
    };
    // Controller execution starts below
    console.log('Announcement Instance View');
    //Calling function
    getAnnouncement();
  };