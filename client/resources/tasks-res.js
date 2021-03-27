module.exports = function($resource, DclCommon) {

  var taskResourceUrl = DclCommon.baseUrl + 'AdminTasks/:id/:action';
  var Resource = $resource(taskResourceUrl, { id: '@id' }, {
    update: { method: 'PUT' }
  });

  var approveNewTeam = function(taskId, done) {
    return Resource.save({id: taskId, action:'approvenewteam'}, {},
      function() { // success
        done(null); 
      }, 
      function(res) { // failure
      done(res);
      });
  }

  var rejectNewTeam = function(taskId, reason, done) {
    return Resource.save({id: taskId, action:'rejectnewteam'}, {'reason': reason},
      function() { // success
        done(null); 
      }, 
      function(res) { // failure
      done(res);
      });
  }


  var getTasks = function(orderFilter) {
    var includeFilter = "requester";
    var filter = {};
    orderFilter = orderFilter || 'created DESC'
    if (orderFilter) {
          filter.order = orderFilter;
    }
    filter.include = includeFilter;
    return Resource.query({filter: filter}).$promise;
  }

  return {
    getTasks: getTasks,
    approveNewTeam: approveNewTeam,
    rejectNewTeam: rejectNewTeam,
    Resource: Resource
  };
};