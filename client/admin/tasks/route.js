
'use strict';
module.exports = function ($stateProvider, TasksListView) {
  console.log('Tasks');
  $stateProvider
    .state('admin.tasks', {
      abstract: true,
      url: "/tasks",
      template: "<div class='container'> <div ui-view> Put your content here</div></div>"
    })
    .state('admin.tasks.list', {
      url: "/tasks",
      template: TasksListView,
      controller: 'TasksListCtrl'
    });
};
