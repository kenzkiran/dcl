module.exports = function ($state, $stateParams, $scope, $log, $sce, $location, $anchorScroll, Ground) {
  console.log('General Grounds List Controller');

  $scope.grounds = [];
  $scope.groundId = $stateParams.id || undefined;
  $scope.currentGround = undefined;
  $scope.searchText = '';

  $scope.setCurrentGround = function (ground) {
    console.log('setCurrentGround');
    var ground1 = angular.copy(ground);
    ground1.url = $sce.trustAsResourceUrl(ground1.url);
    $scope.currentGround = ground1;
  };

  $scope.isCurrentGround = function (ground) {
    return $scope.currentGround !== null && ground !== null && $scope.currentGround.id === ground.id;
  };

  var getGrounds = function () {
    var filter = { where: { and: [{ active: true }] } };

    if ($scope.searchText && $scope.searchText.length > 0) {
      var likeSearch = ".*" + $scope.searchText + ".*";
      filter.where.and.push({
        or: [{ name: { like: likeSearch, options: "i" } }, { address: { like: likeSearch, options: "i" } },
        { city: { like: likeSearch, options: "i" } }]
      });
    };

    Ground.getGrounds(filter).then(function (grounds) {
      $scope.grounds = grounds;
      if ($scope.grounds.length > 0) {
        var g = [];
        if ($scope.groundId) {
          g = _.where(grounds, { id: $scope.groundId });
        }
        g = g[0] || $scope.grounds[0];

        // Embedded Maps is shown for non-mobile
        // and first ground will be selected by default
        // and Maps will be shown by default for first ground
        if (window.innerWidth >= 768) {
          $scope.setCurrentGround(g);
        }
      }
    });
  };

  $scope.getDisplayAddress = function (ground) {
    var address = ground.address || (ground.city || '');
    /* if (ground !== undefined && ground !== null) {
        if (ground.address) {
            address = ground.address;
        }
        if (ground.city) {
            if (address.length > 0) {
                address = address + ', ';
            }
            address = address + ground.city;
        }
    }*/
    return address;
  };

  $scope.gotoMapSection = function () {
    $location.hash('divGenGroundsHdrBar');
    $anchorScroll();
  };

  $scope.openGoogleMapsInNewWindow = function (url) {
    window.open(url);
  };

  $scope.searchGrounds = function () {
    getGrounds();
  };

  /* The actual code execution begin here */
  getGrounds();
};
