module.exports = function(InningBattingEditorView) {
    console.log("Adding directive ptf-batting-editor");
    return {
        restrict: 'A',
        scope: {
            'inning': '='
        },
        template: InningBattingEditorView
    };
};