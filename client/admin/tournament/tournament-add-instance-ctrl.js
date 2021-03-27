module.exports = function($scope, $filter, $modalInstance, info, DclCommon) {
    $scope.divisions = info.divisions;
    $scope.ageGroups = DclCommon.ageGroups;
    $scope.gameTypes = DclCommon.gameTypes;
    $scope.matchTypes = DclCommon.matchTypes;
    $scope.genders = [DclCommon.genders.male, DclCommon.genders.female];
    $scope.isEdit = false;
    if (info.tournament) {
        $scope.isEdit = true;
        $scope.task = 'EDIT';
        $scope.newTourney = angular.copy(info.tournament);
    } else {
        $scope.task = 'ADD';
        $scope.newTourney = {};
    }

    $scope.status = ['ONGOING', 'COMPLETED', 'ABANDONED'];
    $scope.newTourney.status = $scope.newTourney.status || $scope.status[0];
    $scope.newTourney.tourneyType = $scope.newTourney.tourneyType || "League";
    $scope.newTourney.ageGroup =$scope.newTourney.ageGroup ||  $scope.ageGroups[0];
    $scope.newTourney.gender = $scope.newTourney.gender || DclCommon.genders.male;
    $scope.newTourney.gameType = $scope.newTourney.gameType || DclCommon.gameTypes[0];
    $scope.newTourney.matchType = $scope.newTourney.matchType || DclCommon.matchTypes[0];

    $scope.add = function() {
        $modalInstance.close($scope.newTourney);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    //TODO: Following are Calender related stuff, need to move to common place
    $scope.newTourney.startDate = $scope.newTourney.startDate || new Date();
    $scope.format = 'dd-MMMM-yyyy';
    $scope.dateStatus = {
        opened: false
    };
    $scope.open = function(/* $event */) {
        $scope.dateStatus.opened = true;
    };
};
