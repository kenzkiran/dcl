'use strict';
angular.module('dclApp', [
        'ui.router',
        'ui.bootstrap',
        'ngResource',
        'ngCookies',
        require('../common'),
        require('../resources'),
        require('../admin'),
        require('../login'),
        require('../admin/tournament'),
        require('../admin/ground'),
        require('../admin/teams'),
        require('../admin/players'),
        require('../admin/tasks'),
        require('../general/grounds'),
        require('../general/teams'),
        require('../general/tournaments'),
        require('../general/matches'),
        require('../general/players'),
        require('../general/announcements'),
        require('../general/registrations')
    ])
    .run(['$rootScope', '$state', '$stateParams', 'uibDatepickerPopupConfig', function($rootScope, $state, $stateParams, uibDatepickerPopupConfig) {
        console.log("DCL Main");
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.showAdmin = false;
        // Do some global datepicker configuration
        uibDatepickerPopupConfig.closeText = 'Close';
        uibDatepickerPopupConfig.closeOnDateSelection = true;
        uibDatepickerPopupConfig.maxDate = new Date(2025, 7, 26);

    }])
    .config([
        '$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/about');
            $stateProvider
                .state('about', {
                    url: '/about',
                    templateUrl: 'partials/about.html',
                })
            .state('verified', {
                url: '/verified',
                templateUrl: 'partials/verified.html',
            });
        }])

    .controller('dclCtrl', ['$rootScope', '$scope','$cookies', 'Player', '$window', '$state', '$stateParams',
        function($rootScope, $scope, $cookies, Player, $window,  $state, $stateParams) { // jshint unused:false

        /* Reset default any logins */
        $rootScope.resetLogin = function() {
          $rootScope.loggedin = false;
          $rootScope.greeting = "Hello ";
          $cookies.remove('userid');
          $cookies.remove('authorization');
          $rootScope.showAdmin = false;
          $window.localStorage.removeItem('pinfo');
        };

        // update players login info
        $rootScope.updatePlayerLogin = function(player) {
          console.log("UpdatePlayerLogin :", player);
          $rootScope.loggedin = true;
          $rootScope.greeting = "Hello " + player.firstName;
          var pinfo = {firstName: player.firstName, lastName: player.lastName, isAdmin: false};
          pinfo.playerId = player.id;
          if (pinfo.firstName === "DCL" && pinfo.lastName === "Admin") {
            pinfo.isAdmin = true;
            $rootScope.showAdmin = true;
          }
          $window.localStorage.setItem('pinfo', angular.toJson(pinfo));
        };

        // force check will talk to server and check
        // if the user is admin or not.
        $rootScope.isAdmin = function(force_check) {
          var pinfo = $window.localStorage.getItem('pinfo');
          if (pinfo) {
            pinfo = angular.fromJson(pinfo);
            $rootScope.showAdmin = pinfo.isAdmin;
            return pinfo.isAdmin;
          }
          return false;
        };

        $rootScope.checkLogin = function(done) {
          var userId = Player.getCookieUserId();
          if (userId) {
            console.log("Trying to retrieve for userId: ", userId);
            Player.getPlayerByUserId(userId).then(
              function(p) {
                if (p && p.length) {
                  console.log("Received User details: ", p);
                  $rootScope.updatePlayerLogin(p[0]);
                  if (done) { done(p[0]); }
                } else {
                  console.log("Error in retrieving Player for userId: ", userId);
                  $rootScope.resetLogin();
                  if (done) { done(); }
                }
              },function(err) {
                console.log("Failed to get Player details", err);
                $rootScope.resetLogin();
                if (done) { done(); }
              });
          }
        };

        $rootScope.logout = function() {
          console.log("Signing out ");
          Player.signOut(Player.getCookieUserId(), function(err) {
            if (err) {
              console.log("Error in logging out logout: ", err);
            }
            $rootScope.resetLogin();
            $state.go('about');
          });
        };

        function Init() {
          $rootScope.showAdmin = false;
          $rootScope.checkLogin();
        }

        // All processing begin from here
        console.log('DCL Main Controller');
        Init();
}]);



