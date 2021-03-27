var moduleName = 'dcl.login';

var app = angular.module(moduleName, ['ui.router']);

app.constant('SigninView', require('./signin.html'));
app.constant('SignupView', require('./signup.html'));
app.constant('TermsModal', require('./terms-modal.html'));
app.constant('PasswordResetRequestView', require('./password-reset-request.html'));
app.constant('PasswordResetView', require('./password-reset.html'));
app.config(require('./route.js'));

app.controller('SignupCtrl', require('./signup-ctrl.js'));
app.controller('SigninCtrl', require('./signin-ctrl.js'));
app.controller('TermsCtrl', require('./terms-ctrl.js'));
app.controller('PasswordResetCtrl', require('./password-reset-ctrl.js'));
app.controller('PasswordResetRequestCtrl', require('./password-reset-request-ctrl.js'));
module.exports = moduleName;
