module.exports = function ($scope, $log, Tasks, TaskReasonModal, ModalService) {
  $scope.tasks = [];
  function Init() {
    GetTasks();
  }

  $scope.Approve = function (task) {
    console.log("Approved task: ", task);
    Tasks.approveNewTeam(task.id, function (err) {
      if (err) {
        console.log("Error in approving new team");
      }
      GetTasks();
    });
  };

  $scope.Reject = function (task) {
    console.log("Rejected task: ", task);
    var info = { 'task': task };
    var modalInstance = ModalService.addModal(TaskReasonModal, 'TaskReasonCtrl', info);
    modalInstance.result.then(function (intask) {
      console.log("Task Reason: " + intask);
      Tasks.rejectNewTeam(task.id, intask.reason, function (err) {
        if (err) {
          console.log("Error in Rejecting new team");
        }
        GetTasks();
      });
    }, function () {
      console.log("Modal dismissed!");
    });
  };

  function GetTasks() {
    Tasks.getTasks().then(function (tasks) {
      $scope.tasks = tasks;
      console.log(tasks);
    }).catch(function (err) {
      console.log("Error in Get Tasks : ", err);
    });
  }

  // Begins here
  Init();
};