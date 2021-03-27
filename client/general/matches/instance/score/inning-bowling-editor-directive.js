module.exports = function(InningBowlingEditorView) {
    console.log("Adding directive ptf-bowling-editor");
    return {
        restrict: 'A',
        scope: {
            'inning': '=',
            'addBowler': '&'
        },
        template: InningBowlingEditorView
    };
};