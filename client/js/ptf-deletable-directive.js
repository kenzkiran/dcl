/***
 * ptfDeletable will add a hover delete button on any element enclosing.
 * The controller exposing this directive need to provide a callback function
 * 'onDelete' in it's controller.
 */
angular.module('dclApp').directive('ptfDeletable', function() {
    console.log("Adding directive");
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            'item': '=',
            'delete': '&onDelete'
        },
        templateUrl: 'templates/ptf-deletable.html'
    };
});

