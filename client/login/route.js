'use strict';
module.exports = function($stateProvider, SigninView, SignupView, PasswordResetRequestView, PasswordResetView) {
    $stateProvider
        .state('signin', {
            url: "/signin",
            template: SigninView,
            controller: 'SigninCtrl'
        })
        .state('signup', {
            url: "/signup",
            template: SignupView,
            controller: 'SignupCtrl'
        })
        .state('requestresetpassword', {
            url: "/requestresetpassword",
            template: PasswordResetRequestView,
            controller: 'PasswordResetRequestCtrl'
        })
        .state('resetpassword', {
            url: "/resetpassword",
            template: PasswordResetView,
            controller: 'PasswordResetCtrl'
        });
};
