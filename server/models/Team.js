var log = require('../utils/logger.js')();
var _ = require('underscore');
var CommonConfigs = require('../CommonConfigs.json');

module.exports = function (Team) {
  Team.matches = function (id, cb) {
    var Match = Team.app.models.Match;
    var filter = {
      order: 'date DESC',
      limit: 10,
      include: ["teamOne", "teamTwo", "umpireOne", "umpireTwo", "ground"],
      where: { or: [{ teamOneId: id }, { teamTwoId: id }] }
    };
    Match.find(filter, cb);
  };

  Team.umpiring = function (id, cb) {
    var Match = Team.app.models.Match;
    var filter = {
      order: 'date DESC',
      limit: 10,
      include: ["teamOne", "teamTwo", "umpireOne", "umpireTwo", "ground"],
      where: { or: [{ umpireOneId: id }, { umpireTwoId: id }] }
    };
    Match.find(filter, cb);
  };

  Team.observe('before save', function updateFields(ctx, next) {
    if (ctx.instance) {
      ctx.instance.name = ctx.instance.name.toLowerCase();
    } else if (ctx.data) {
      ctx.data.name = ctx.data.name.toLowerCase();
    }
    next();
  });

  Team.completedMatches = function (id, cb) {
    var Match = Team.app.models.Match;
    var filter = {
      order: 'date DESC',
      limit: 5,
      include: ["teamOne", "teamTwo", "ground"],
      where:
      {
        and: [
          { or: [{ teamOneId: id }, { teamTwoId: id }] },
          { "scoreSheetStatus": "submit" }
        ]
      }
    };
    Match.find(filter, cb);
  };

  /** Request New Team */
  Team.requestnewteam = function (name, type, location, playerId, cb) {
    var AdminTasks = Team.app.models.AdminTasks;
    var newteam = {
      'name': name,
      'type': type,
      'location': location,
      'playerId': playerId
    }
    console.log("Add new Admin Task for newteam : ", newteam);
    AdminTasks.addNewTeamTask(newteam, function(err, newtask) {
      var result = { status: 'fail' };
      if (err) {
        console.log("Error Adding New Team: ", err);
        result.reason = 'Internal Error';
        return cb(null, result);
      }
      result.status = 'success';
      return cb(null, result);
    });
  }

  /* Verify if a new team can be registered 
   * Check if there is duplicate name + type match
   * then check if the request is from a captain
   * who is of the same type. If so, reject.
   * Example:
   * If Request: Mysore Royals : Tape : CaptainX
   * Reject if we have {'Mysore Royals', 'Tape'}
   * Succeed if we have {'Mysore Royals', 'Leather/T30'}
   * 
   * Next get all teams and see if the requesting
   * User is captain of another team of same type
   * 
   * So if User is captain of another tape ball team
   * Reject Request
   * If User is not a captain of any team, or captain
   * of Leather ball team, then OK for Tape, T30.
   * So basically one captain for two different teams
   * of same type are not allowed.
   */
  Team.verifynewteam = function (name, type, location, playerId, cb) {
    console.log('Verify Team: ', name, type, location, playerId);
    name = name.toLowerCase();
    location = location.toLowerCase();
    var filter = { where: { 'name': name, 'type': type} };
    var result = { status: 'fail' };
    Team.find(filter, function (err, teams) {
      if (err || teams.length) {
        if (err)
          console.log("Error in finding teams: ", err);
        result.status = 'fail';
        result.reason = 'Duplicate, Team Already Registered';
        result.data = { 'name': name, 'type': type };
        return cb(null, result);
      }
      var includeFilterRoles = ["captain", "vice", "admin"];
      var filter = { include: includeFilterRoles };

      /* Find all teams including their captains */
      Team.find(filter, function (err, teams) {
        if (err) {
          return cb(null, { status: 'fail', reason: 'Internal Error' });
        }
        // No teams found, then we succeed
        if (!teams) {
          teams = [];
        }
        for (var i = 0; i < teams.length; ++i) {
          if (teams[i]) {
            let team = teams[i];
            // console.log("Team Info: ", team.name, team.type);
            if (team.__data && team.__data && team.__data.captain) {
              if (playerId === team.__data.captain.id.toString() && team.type === type) {
                var result = { status: 'fail' };
                result.reason = "Already Captain of another : " + type + " team: " + team.name;
                return cb(null, result);
              }
            }
          }
        }

        var AdminTasks = Team.app.models.AdminTasks;
        var whereFilter = {"where": {"tasktype": CommonConfigs.AdminTasks.newteam, "status": "progress"}};
        AdminTasks.find(whereFilter, function(err, tasks) {
          if (err) {
            return cb(null, {status: 'fail', reason: 'Internal Error' });
          }
          console.log("Number of matching tasks: ", tasks.length)
          for (i = 0; i < tasks.length; ++i) {
            var teamInfo = tasks[i].__data.data;
            console.log(teamInfo);
            if (tasks[i].__data.playerId.toString() === playerId) {
              return cb(null, {status: 'fail', reason: "Player has a pending team request"});
            }
            if (teamInfo.name === name && teamInfo.type === type) {
              return cb(null, {status: 'fail', reason: "Duplicate team name: Pending team"});
            }
          }
          return cb(null, { status: 'success' });
        });
      });
    });
  }
  /**
   * Add remoted method to retrieve matches for team that have scoresheets
   */
  Team.remoteMethod(
    'matches',
    {
      description: "Get matches for team",
      accepts: [
        { arg: 'id', type: 'string', required: true }
      ],
      returns: { arg: 'matches', type: 'array' },
      http: { path: '/:id/matches', verb: 'get' }
    }
  );

  /**
   * Add remoted method to retrieve 10 recent matches
   */
  Team.remoteMethod(
    'completedMatches',
    {
      description: "Get Completed matches for team",
      accepts: [
        { arg: 'id', type: 'string', required: true }
      ],
      returns: { arg: 'matches', type: 'array' },
      http: { path: '/:id/completedMatches', verb: 'get' }
    }
  );

  /**
   * Add remoted method to retrieve 10 recent umpirings
   */
  Team.remoteMethod(
    'umpiring',
    {
      description: "Get Completed matches for team",
      accepts: [
        { arg: 'id', type: 'string', required: true }
      ],
      returns: { arg: 'matches', type: 'array' },
      http: { path: '/:id/umpiring', verb: 'get' }
    }
  );

  /**
   * Add remoted method to retrieve verify new team
   */
  Team.remoteMethod(
    'verifynewteam',
    {
      description: "Verify New Team",
      accepts: [
        { arg: 'name', type: 'string', required: true },
        { arg: 'type', type: 'string', required: true },
        { arg: 'location', type: 'string', required: true },
        { arg: 'playerId', type: 'string', required: true }
      ],
      returns: { arg: 'result', type: 'object' },
      http: { path: '/verifynewteam', verb: 'get' }
    }
  );

  /**
   * Add remoted method to request new team addition
   */
  Team.remoteMethod(
    'requestnewteam',
    {
      description: "Request New Team",
      accepts: [
        { arg: 'name', type: 'string', required: true },
        { arg: 'type', type: 'string', required: true },
        { arg: 'location', type: 'string', required: true },
        { arg: 'playerId', type: 'string', required: true }
      ],
      returns: { arg: 'result', type: 'object' },
      http: { path: '/requestnewteam', verb: 'get' }
    }
  );

  /**
   * Add remoted method to request new team addition
   */
  Team.remoteMethod(
    'approvenewteam',
    {
      description: "Approve New Team",
      accepts: [
        { arg: 'playerId', type: 'string', required: true }
      ],
      returns: { arg: 'result', type: 'object' },
      http: { path: '/approvenewteam', verb: 'post' }
    }
  );

};