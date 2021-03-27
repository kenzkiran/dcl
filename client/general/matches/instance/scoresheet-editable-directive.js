module.exports = function(ScoreSheetEditableView) {
    console.log("Adding directive Editable ScoreSheet");
    return {
        restrict: 'A',
        template: ScoreSheetEditableView
    };
};