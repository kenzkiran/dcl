module.exports = function (AdminTasks) {
  var CommonConfigs = require("../CommonConfigs.json");
  console.log("AdminTasks");
  class NewTeamTask {
    constructor(newteam) {
      this.data = newteam;
      this.tasktype = CommonConfigs.AdminTasks.newteam;
      this.playerId = newteam.playerId;
    }
  }

  function SendTestEmail(email) {
    AdminTasks.app.models.Email.send({
      to: email,
      from: 'dclweb@yahoo.com',
      subject: 'Test Email',
      html: "<h2> This is a test email from DCL </h2>"
    }, function(err, mail) {
      console.log('email sent!');
      if (err) {
        console.log("Error sending New Team Approval to: " +  email + " error: " + err);
      }
    });
  }

  function SendSuccessEmail(newtask, reason) {
    var newteamname = newtask.data.name;
    var requester_email = newtask.requester.owner.email;
    var message = '<p> New Team Request: ' +  '<strong>' + newteamname + '</strong>' + ' has been Approved! </p>';
    console.log("Sending Success Email to : ", requester_email);
    AdminTasks.app.models.Email.send({
      to: requester_email,
      from: 'dclweb@yahoo.com',
      subject: 'New Team Request: Approved',
      html: message
    }, function(err, mail) {
      console.log('email sent!');
      if (err) {
        console.log("Error sending New Team Approval to: " +  requester_email + " for team: " + newteamname);
      }
    });
  }

  function SendRejectEmail(newtask, reason) {
    var newteamname = newtask.data.name;
    var requester_email = newtask.requester.owner.email;
    var message = "New Team Request: " + newteamname + " has been Rejected!";
    console.log("Sending Reject Email to : ", requester_email);
    AdminTasks.app.models.Email.send({
      to: requester_email,
      from: 'dclweb@yahoo.com',
      subject: 'New Team Request: Rejected',
      html: '<h3>' + message +  '</h3> <br/> <p> Reason: ' + reason +  '</p>'
    }, function(err, mail) {
      console.log('email sent!');
      if (err) {
        console.log("Error sending New Team Rejection to: " +  requester_email + " for team: " + newteamname);
      }
    });
  }


  AdminTasks.observe('before save', function updateTimestamp(ctx, next) {
    if (ctx.instance) {
      ctx.instance.created = new Date();
    } else {
      ctx.data.created = new Date();
    }
    next();
  });

  AdminTasks.addNewTeamTask = function (newTeam, cb) {
    var newteamtask = new NewTeamTask(newTeam);
    console.log(newteamtask);
    AdminTasks.upsert(newteamtask, cb)
  }

  AdminTasks.OnApproved = function (task, team,reason, cb) {
    var Team = AdminTasks.app.models.Team;
    // Check again for duplication
    Team.find({ where: { name: team.name, type: team.type } }, function (err, teams) {
      if (err) {
        return cb(null, { result: 'fail', reason: "Internal Error" });
      }
      if (teams.length) {
        return cb(null, { result: "fail", reason: "Duplicate Team Name and Type" });
      }
      var newtask = task.toJSON();
      team.captainId = newtask.playerId;
      Team.upsert(team, function (err, newteam) {
        if (err || !newteam) {
          console.log("Error in upserting a new team: ", team);
          return cb(null, { result: 'fail', reason: "Team creation failed" });
        }
        SendSuccessEmail(newtask, reason);
        newteam.players.add(team.captainId, function(err) {
          if (err) {
            console.error("Error in adding captain to team!");
          }
          return task.updateAttributes({status: 'completed', result: 'approved' }, function (err, t) {
            if (err) {
              console.log("Error in updating task: ", task.id);
            }
            cb(null, { result: 'success' });
          });
        });
      });
    });
  }

  AdminTasks.OnRejected = function (task, team, reason, cb) {
    var newtask = task.toJSON();
    SendRejectEmail(newtask, reason);
    return task.updateAttributes({status: 'completed', result: 'rejected' }, function (err, t) {
      if (err) {
        console.log("Error in updating task");
      }
      cb(null, {result: 'success'});
    });
  }

  AdminTasks.approveOrRejectNewTeam = function (is_approve, id, reason, cb) {
    /* Find the task */
    // if not found, return failure reason
    AdminTasks.findById(id, { "include": { "requester": "owner" } }, function (err, task) {
      if (err || !task) {
        return cb(null, { result: "fail", reason: "Task Not Found !" });
      }
      // Verify if this is a 'TaskTypeNewTeam'
      if (task.tasktype !== CommonConfigs.AdminTasks.newteam) {
        return cb(null, { result: "fail", reason: "Invalid Task Type: " + task.tasktype });
      }

      if (is_approve) {
        reason = "New Team Registration is Approved!";
      } else {
        reason = reason || "New Team Registration is Rejected, Please contact DCL Admin if the decision is incorrect."
      }
      var team = { name: task.data.name, type: task.data.type, location: task.data.location };
      console.log("Create a new team: ", team);

      if (is_approve) {
        // approve path
        AdminTasks.OnApproved(task, team, reason, cb);
      } else {
        AdminTasks.OnRejected(task, team, reason, cb);
      }
    });
  }

  AdminTasks.sendtestemail = function (email, cb) {
    SendTestEmail(email);
    cb(null, {success: true});
  }

  AdminTasks.rejectnewteam = function (id, reason, cb) {
    AdminTasks.approveOrRejectNewTeam(false, id, reason, cb);
  }

  AdminTasks.approvenewteam = function (id, cb) {
    AdminTasks.approveOrRejectNewTeam(true, id, "", cb);
  }

  /**
   * Add remoted method to request new team addition
   */
  AdminTasks.remoteMethod(
    'rejectnewteam',
    {
      description: "Reject New Team",
      accepts: [
        { arg: 'id', type: 'string', required: true },
        { arg: 'reason', type: 'string', required: true }
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/:id/rejectnewteam', verb: 'post' }
    }
  );

  /**
   * Add remoted method to request new team addition
   */
  AdminTasks.remoteMethod(
    'approvenewteam',
    {
      description: "Approve New Team",
      accepts: [
        { arg: 'id', type: 'string', required: true }
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/:id/approvenewteam', verb: 'post' }
    }
  );

    /**
   * Add remoted method to request new team addition
   */
  AdminTasks.remoteMethod(
    'sendtestemail',
    {
      description: "Send test email",
      accepts: [
        { arg: 'email', type: 'string', required: true }
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/sendtestemail', verb: 'post' }
    }
  );
}