var log = require('../utils/logger.js')();
var _ = require('underscore');
var statsEngine = require('../utils/stats-engine.js');
var config = require('../config.json');

// TODO (Ravi): Fix this message
const DCL_PLAYER_MESSAGE = "The player bears the responsiblity to ensure that he/she doesn't represent" +
  " two different teams in the same league. In case the player is found guilty of this, DCL Management " +
  " will impose penalties as per <a href=\"https://dallascricket.net/Documents/DCL_By_Laws.pdf\"> DCL by laws </a>."
module.exports = function (Player) {
  /**
   * Sends email to player on addition or removal from a team.
   * @param {string email} to_email Player's email
   * @param {string} player_name  Player's name
   * @param {string} team_name Team's name
   * @param {boolean} is_add specifies if the player was added or removed
   */
  function SendEmail(to_email, player_name, team_name, is_add) {
    console.log("Sending email to : ", to_email, is_add);
    var action_text = is_add ? "added" : "removed";
    var to_or_from = is_add ? "to" : "from";
    var message = '<p> Player : ' +  '<strong>' + player_name 
      + '</strong>' + ' was ' + action_text + " " + to_or_from + ' team <strong>' + team_name + '</strong></p>'
      + '</br> <strong> Important Note: </strong> </br> <p>' + DCL_PLAYER_MESSAGE + '</p>';
    Player.app.models.Email.send({
      to: to_email,
      from: 'dclweb@yahoo.com',
      subject: "Team: " + team_name + " has " + action_text + " you",
      html: message
    }, function(err, mail) {
      if (err) {
        console.log("Error sending Player Transfer Confirmation to: " +  to_email + " for team: " + team_name);
      }
    });
  }


  /**
   * Add Or Remove Team By Id
   * @id : Player Id
   * @teamId: Team Id to add
   * is_add : boolean to add or remove
   * cb: cb if add team addition was success
   *  or failure.
   */
  Player.addOrRemoveTeamById = function (id, teamId, is_add, cb) {
    var Team = Player.app.models.Team;
    log.info({ id: id }, "Received playerId: ");
    log.info({ teamId: teamId }, "Received teamId: ");

    Team.findById(teamId, function (err, team) {
      if (err || !team) {
        err = err || new Error("Team Not found");
        log.error("Team Not Found");
        return cb(err);
      }
      console.log("Found Team: " + team.name);
      Player.findById(id, {include: "owner"}, function (err, player) {
        if (err || !player) {
          err = err || new Error("Player Not found");
          log.error("Player Not Found");
          return cb(err);
        }
        let player_json = player.toJSON();
        var send_email_func = function() {
          var to_email = player_json.owner.email;
          var player_name = player_json.firstName + " " + player_json.lastName;
          var team_name = team.name;
          var func = function() {
            SendEmail(to_email, player_name, team_name, is_add);
          };
          return func;
        }();
        if (is_add) {
          return player.teams.add(team, function(err) {
            if (err) {
              console.log("Error adding player to team");
            }
            process.nextTick(function() {send_email_func();});
            return cb(null);
          });
        } else {
          process.nextTick(function() {send_email_func();});
          return player.teams.remove(team, cb);
        }
      });
    });
  };

  /***
   * Removes a player to from a specific team.
   * @param id {string} Player Id
   * @param teamId {string} Team Id
   * @param cb {err, TeamPlayer} standard callback
   */
  Player.removeTeamById = function (id, teamId, cb) {
    Player.addOrRemoveTeamById(id, teamId, false, cb);
  }
  /***
   * Adds a player to a specific team.
   * @param id {string} Player Id
   * @param teamId {string} Team Id
   * @param cb {err, TeamPlayer} standard callback
   */
  Player.addTeamById = function (id, teamId, cb) {
    Player.addOrRemoveTeamById(id, teamId, true, cb);
  };

  Player.adminlist = function(id, cb) {
    var whereFilter = {}
    if (id) {
      whereFilter = {'id': id };
    }
    console.log("Received id: ", id);
    var filter = {where: whereFilter, include: 'owner'};
    Player.find(filter, function(err, players) {
      if (err || players.length == 0) {
        return cb(new Error("No Admin List Players"));
      }
      var result = {players: []};
      result.players = _.forEach(players, function(p) {
        p.phonenumber = p.__data.phone;
        p.address1 = p.__data.street_address_1;
        p.address2 = p.__data.street_address_2;
        p.city1 = p.__data.city;
        p.zipcode1 = p.__data.zipcode;
        p.state1 = p.__data.state;
        console.log(p);
      });
      cb(null, result);
    });
  }

  /***
   * Checks if player's email, firstName and lastName
   * is already registered.
   */
  Player.checkIfPlayerExists = function (info, cb) {
    var User = Player.app.models.User;
    User.find({ where: { email: info.email } }, function (err, users) {
      if (err || users.length) {
        log.error("Error in looking up users", err);
        cb(new Error("Player Email is already registered"));
        return;
      }

      Player.find({ where: { firstName: info.firstName, lastName: info.lastName } }, function (err, players) {
        if (err || players.length) {
          var error_msg = "Player with Name already registered: " + info.firstName + "," + info.lastName;
          log.error(error_msg);
          return cb(new Error(error_msg));
        }
        return cb(null);
      });
    });
  };

  Player.afterRemote('signIn', function (context, accessToken, next) {
    let res = context.res;
    if (accessToken != null) {
      if (accessToken.id != null) {
        console.log("Setting Access Token Cookie", accessToken);
        res.cookie('authorization', accessToken.id, {
          signed: true,
          maxAge: accessToken.ttl
        });
        console.log("Setting cookie userid", accessToken.userId);
        res.cookie('userid', accessToken.userId);
      }
    }
    return next();
  });

  Player.afterRemote('signOut', function (context, result, next) {
    let res = context.res;
    if (res.statusCode == 200) {
      console.log("After Remote signOut, clearing cookie");
      res.clearCookie("authorization");
      res.clearCookie("userid");
      return res.redirect(context.req.headers.host + "/index.html#/about");
    }
    return next();
  });


  Player.getStats = function (id, cb) {
    console.log("Getting player stats by id: " + id);
    statsEngine.playerStats(id, cb);
  };


  Player.updateProfile = function (info, cb) {
    log.info("Update User Profile: ", info);
    if (!info.id) {
      return cb(new Error("Player Id not found"));
    }

    Player.findById(info.id, function (err, player) {
      if (err || !player) {
        return cb(new Error("Player with id: " + info.id + " Not found"));
      }
      if (info.userId) {
        delete info.userId;
      }
      player.updateAttributes(info, cb);
    });
  }

  Player.signIn = function (info, cb) {
    var User = Player.app.models.User;
    User.login({
      email: info.email,
      password: info.password
    }, 'user', cb);
  };

  Player.signOut = function (req, cb) {
    console.log("Signout recevied: ", req.signedCookies.authorization);
    var User = Player.app.models.User;
    User.logout(req.signedCookies.authorization, cb);
  };

  Player.changePassword = function(info, cb) {
    var User = Player.app.models.User;
    Player.findById(info.id, function(err, player) {
      if (err || !player) {
        console.log("Error in finding Player by Id: ", id);
        cb(new Error("Error in changing password"));
        return;
      }
      User.changePassword(player.userId, info.currentpassword, info.password, cb)
    });
  }

  Player.updatePlayerAdmin = function(info, cb) {
    console.log("Player Update Received ", info);
    cb();
  }

  Player.testremove = function(id, cb) {
    var User = Player.app.models.User;
    console.log("Removing player with id: ", id);
    Player.findById(id, function(err, player) {
      if (err || !player) {
        console.log("Error in finding Player by Id: ", id);
        cb(new Error("Error in removing player"));
        return;
      }
      var userId = player.userId;
      User.deleteById(userId, function(err){
        console.log("User deleted: error: ", err);
        Player.deleteById(id, cb);
      });
    });
  }

  Player.findbyemail = function(email, cb) {
    console.log("Find by Email");
    var User = Player.app.models.User;
    User.find({ where: { email: email } }, function (err, users) {
      if (err || users.length === 0) {
        cb(null, []);
        return;
      }
      Player.find({where: {userId: users[0].id}}, function(err, players) {
        if (err || players.length === 0) {
          console.log("Player with email id: " + email + " Not found");
          return cb(null, []);
        }
        return cb(null, players);
      });
    });
  }

  Player.resetpassword = function(info, req, cb) {
    var User = Player.app.models.User;
    var AccessToken = Player.app.models.AccessToken;
    AccessToken.findById(info.access_token, function(err, a) {
      if (err || !a) {
        console.log('Access Token expired or Invalid');
        return cb(new Error("Access Token Invalid or Expired"));
      };
      var userId = a.__data.userId;
      User.findById(userId, function(err, user) {
        if (err || !user) {
          log.error("User not found for id: ", userId);
          return cb(new Error("User not found!"));
        }
        console.log("Now Updating Password for user: ", user);
        User.upsert({id: userId, password: info.password}, function(err, user) {
          if (!err) {
            console.log("Password Update Successful");
          }
          cb(err);
        });
      });
    });
  }

  Player.requestresetpassword = function(email, cb) {
    log.info("Received Password Request for email ", email);
    var User = Player.app.models.User;
    User.resetPassword({'email': email}, cb);
  }

  Player.personalDetails = function(id, req, cb) {
    var AccessToken = Player.app.models.AccessToken;
    let atoken = req.accessToken.__data.id;
    console.log("Ravi received: ", id, atoken);
    AccessToken.findById(atoken, function(err, a) {
      var userId = a.__data.userId.toJSON();
      Player.findById(id, {"include": "owner"}, function(err, p) {
        if (err || !p) {
          return cb(null, {status: "Player Not found: " + id});
        }
        let player = p.toJSON();
        if (player.userId.toJSON() === userId) {
          console.log("Same User, so updating user details");
          player.phonenumber = p.__data.phone;
          player.address1 = p.__data.street_address_1;
          player.address2 = p.__data.street_address_2;
          player.city1 = p.__data.city;
          player.zipcode1 = p.__data.zipcode;
          player.state1 = p.__data.state;
          console.log(player);
        }
        return cb(null, player);
      });
    });
  }

  Player.signUp = function (info, cb) {
    log.info("Signing up new player: ", info);
    var User = Player.app.models.User;
    info.firstName = info.firstName.toLowerCase();
    info.lastName = info.lastName.toLowerCase();
    info.middleName = info.middleName || "";
    info.middleName = info.middleName.toLowerCase();
    info.city = info.city.toLowerCase();
    Player.checkIfPlayerExists(info, function (err) {
      if (err) {
        log.info("Check Player Exists fails: ", err);
        return cb(err);
      }
      // If we are here it means, the player is not a duplicate player
      log.info("Creating a new user: ", info);
      User.create({ email: info.email, password: info.password }, function (err, newplayeruser) {
        if (err) {
          log.error("Error in creating a new user : ", info.email);
          return cb(err);
        }
        info.middleName = info.middleName || "";
        var new_player = {
          'firstName': info.firstName,
          'middleName': info.middleName,
          'lastName': info.lastName,
          'phone': info.phone,
          'userId': newplayeruser.id,
          'street_address_1': info.address1,
          'street_address_2': info.address2 || "",
          'state': info.state || 'TX',
          'city': info.city || 'dallas',
          'zipcode': info.zipcode || '00000',
          'created': Date.now(),
        };

        Player.create(new_player, function (err, newplayer) {
          if (err || !newplayer) {
            log.error("Error creating User: ", info.firstName, info.lastName);
            return cb(err);
          }

          console.log("Sending an email to: ", newplayeruser.email);
          var options = {
            type: 'email',
            to: newplayeruser.email,
            from: 'dclweb@yahoo.com',
            subject: 'Thanks for registering with DCL',
            redirect: '/index.html#/verified',
            user: newplayeruser
          };
          newplayeruser.verify(options, function (err, response) {
            if (err) {
              console.log("Error in sending email verification")
              Player.deleteById(newplayer.id);
              User.deleteById(newplayeruser.id);
              return cb(err);
            }
            console.log("Success in creating a new User: ", newplayer);
            cb(null, newplayer);
          });
        });
      });
    });
  };



  /**
   * Add remoted method to add a Team By Id to a specific player
   */
  Player.remoteMethod(
    'addTeamById',
    {
      description: "Add another team to Player by TeamId",
      accepts: [
        { arg: 'id', type: 'string', required: true },
        { arg: 'teamId', type: 'string', required: true }
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/:id/addTeamById', verb: 'post' }
    }
  );

  Player.remoteMethod(
    'removeTeamById',
    {
      description: "Remove team from Player by TeamId",
      accepts: [
        { arg: 'id', type: 'string', required: true },
        { arg: 'teamId', type: 'string', required: true }
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/:id/removeTeamById', verb: 'post' }
    }
  );

  /**
   * Remote method to get player stats
   */
  Player.remoteMethod(
    'getStats',
    {
      description: "Get Player Stats",
      accepts: [
        { arg: 'id', type: 'string', required: true }
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/:id/stats', verb: 'get' }
    }
  );

  /**
   * Remote method to signup a new player
   */
  Player.remoteMethod(
    'signUp',
    {
      description: "Signup new player",
      accepts: [
        { arg: 'info', type: 'object', required: true }
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/signup', verb: 'post' }
    }
  );

  /**
   * Remote method to signup a new player
   */
  Player.remoteMethod(
    'signIn',
    {
      description: "Signin player",
      accepts: [
        { arg: 'cred', type: 'object', required: true }
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/signin', verb: 'post' }
    }
  );

  /**
   * Remote method to signout a player
   */
  Player.remoteMethod(
    'signOut',
    {
      description: "SignOut player",
      accepts: [
        { arg: 'req', type: 'object', 'http': { source: 'req' } },
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/signout', verb: 'post' }
    }
  );

  /**
   * Remote method to update a profile
   */
  Player.remoteMethod(
    'updateProfile',
    {
      description: "Update Player Profile",
      accepts: [
        { arg: 'info', type: 'object', required: true }
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/updateProfile', verb: 'post' }
    }
  );

  /**
   * Remote method to update a profile
   */
  Player.remoteMethod(
    'updatePlayerAdmin',
    {
      description: "Update Player Admin Profile",
      accepts: [
        { arg: 'info', type: 'object', required: true }
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/updatePlayerAdmin', verb: 'post' }
    }
  );

  /**
   * Remote method to get admin list of players
   */
  Player.remoteMethod(
    'adminlist',
    {
      description: "Get Admin Players List",
      accepts: [
        { arg: 'id', type: 'string', required: false },
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/:id/adminlist', verb: 'get' }
    }
  );

  /**
   * Remote method to get admin list of players
   */
  Player.remoteMethod(
    'changePassword',
    {
      description: "ChangePassword",
      accepts: [
        { arg: 'info', type: 'object', required: true },
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/changepassword', verb: 'post' }
    }
  );

  Player.remoteMethod(
    'requestresetpassword',
    {
      description: "Request Reset password",
      accepts: [
        { arg: 'email', type: 'string', required: true },
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/requestresetpassword', verb: 'post' }
    }
  );

  Player.remoteMethod(
    'resetpassword',
    {
      description: "Reset password",
      accepts: [
        { arg: 'info', type: 'object', required: true },
        {arg: 'req', type: 'object', 'http': {source: 'req'}},
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/resetpassword', verb: 'post' }
    }
  );

  Player.remoteMethod(
    'findbyemail',
    {
      description: "Find By Email",
      accepts: [
        {arg: 'email', type: 'string', required: true }
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/findbyemail', verb: 'get' }
    }
  );

  Player.remoteMethod(
    'personalDetails',
    {
      description: "Personal Details",
      accepts: [
        { arg: 'id', type: 'string', required: true },
        {arg: 'req', type: 'object', 'http': {source: 'req'}},
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/:id/personalDetails', verb: 'get' }
    }
  );

  Player.remoteMethod(
    'testremove',
    {
      description: "Remove Player from Player by TeamId",
      accepts: [
        { arg: 'id', type: 'string', required: true },
      ],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/:id/testremove', verb: 'post' }
    }
  );
};