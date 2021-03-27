module.exports = function ($resource, DclCommon) {
  console.log('Resource: Teams: ' + DclCommon.baseUrl);

  var includeFilter = [];

  var includeFilterPlayers = ["players"];

  var includeFilterRoles = ["captain", "vice", "admin"];

  var whereFilter = {
    "active": true
  };

  var teamResourceUrl = DclCommon.baseUrl + 'Teams/:id/:action';
  var Resource = $resource(teamResourceUrl, { id: '@id' }, {
    update: { method: 'PUT' }
  });

  var getTeams = function (orderFilter) {
    var filter = { include: includeFilterRoles };

    if (orderFilter) {
      filter.order = orderFilter;
    }
    return Resource.query({ filter: filter }).$promise;
  };

  var getActiveTeams = function () {
    return Resource.query({ filter: { include: includeFilter, where: whereFilter } }).$promise;
  };

  var getTeam = function (teamId) {
    return Resource.get({ id: teamId }).$promise;
  };

  var getTeamAndRoles = function (teamId) {
    return Resource.get({ id: teamId, filter: { include: includeFilterRoles } }).$promise;
  };

  var getCompletedMatches = function (teamId) {
    return Resource.get({ id: teamId, action: 'completedMatches' }).$promise;
  };

  var getMatches = function (teamId) {
    return Resource.get({ id: teamId, action: 'matches' }).$promise;
  };

  var getUmpiring = function (teamId) {
    return Resource.get({ id: teamId, action: 'umpiring' }).$promise;
  };

  var getTeamAndPlayers = function (teamId) {
    return Resource.get({ id: teamId, filter: { include: includeFilterPlayers } }).$promise;
  };

  var upsertTeam = function (newTeam) {
    var t = new Resource();
    t.name = newTeam.name;
    t.location = newTeam.location;
    t.active = newTeam.active;
    t.type = newTeam.type;
    t.captainId = newTeam.captainId;
    t.viceId = newTeam.viceId;
    t.adminId = newTeam.adminId;
    if (newTeam.id) {
      t.id = newTeam.id;
      return t.$update();
    }
    return t.$save();
  };


  function getTeamPlayerResource(teamId) {
    var teamPlayerResourceUrl = DclCommon.baseUrl + 'Teams/:teamId' + '/players/:id';
    return $resource(teamPlayerResourceUrl, { teamId: teamId, id: '@id' }, { update: { method: 'PUT' } });
  }

  var addPlayer = function (teamId, newPlayer) {
    var TeamPlayer = getTeamPlayerResource(teamId);
    var p = new TeamPlayer();
    p.firstName = newPlayer.firstName;
    p.lastName = newPlayer.lastName;
    p.battingStyle = newPlayer.battingStyle;
    p.bowlingStyle = newPlayer.bowlingStyle;
    p.active = newPlayer.active;
    p.certified = newPlayer.certified;
    if (p.certified) {
      p.certLevel = newPlayer.certLevel || 1;
    }
    if (newPlayer.id) {
      p.id = newPlayer.id;
      return p.$update();
    }
    return p.$save();
  };

  var getPlayers = function (teamId) {
    var TeamPlayer = getTeamPlayerResource(teamId);
    return TeamPlayer.query().$promise;
  };

  var teamTypeToPostfix = function (type) {
    if (type === "Tape") {
      return "";
    }
    if (type === "Leather") {
      return "LCC";
    }
    if (type === "T30") {
      return "T30";
    }
  }

  var VerifyOrRequestNewTeam = function (teamInfo, is_verify, cb) {
    var query = {
      action: is_verify ? 'verifynewteam' : 'requestnewteam',
      name: teamInfo.name.toLowerCase(),
      type: teamInfo.type,
      location: teamInfo.location.toLowerCase(),
      playerId: teamInfo.playerId
    }

    console.log(teamInfo);
    var p = Resource.get(query).$promise;
    p.then(function (result) {
      cb(null, result);
    }).catch(function (error) {
      cb(error);
    });
  }

  var requestNewTeam = function (teamInfo, cb) {
    VerifyOrRequestNewTeam(teamInfo, false, cb);
  }

  var verifyNewTeamAvailabilty = function (teamInfo, cb) {
    VerifyOrRequestNewTeam(teamInfo, true, cb);
  }

  return {
    getUmpiring: getUmpiring,
    getMatches: getMatches,
    getCompletedMatches: getCompletedMatches,
    getTeamAndPlayers: getTeamAndPlayers,
    getPlayers: getPlayers,
    addPlayer: addPlayer,
    getTeams: getTeams,
    getTeam: getTeam,
    upsertTeam: upsertTeam,
    getActiveTeams: getActiveTeams,
    teamTypeToPostfix: teamTypeToPostfix,
    requestNewTeam: requestNewTeam,
    verifyNewTeamAvailabilty: verifyNewTeamAvailabilty,
    Resource: Resource
  };
};
