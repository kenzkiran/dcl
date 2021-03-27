module.exports = function($stateProvider, MatchesListView, MatchInstanceView, MatchInstanceEdit) {
    $stateProvider
        .state('matches', {
            abstract: true,
            url: "/matches",
            template: '<div class="container"><div ui-view> Put your content here </div></div>'
        })
        .state('matches.list', {
            url: "",
            template: MatchesListView
        })
        .state('matches.iview', {
            url: "/view/:id",
            template: MatchInstanceView,
            controller: 'MatchInstanceViewCtrl'
        })
        .state('matches.iedit', {
            url: "/edit/:id",
            template: MatchInstanceEdit,
            controller: 'MatchInstanceCtrl'
        });
};