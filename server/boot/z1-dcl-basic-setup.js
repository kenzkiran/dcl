/**
 * Created by kenzkiran on 9/29/18.
 */

module.exports = function(app) {
  var async = require('async');

  console.log("DCL Z1 : Basic Setup I");
  var User = app.models.User;
  var Role = app.models.Role;
  var Player = app.models.Player;
  var RoleMapping = app.models.RoleMapping;
  var admin_user = undefined;
  var config = require('../config.json');

  CreateAdminIfNeeded(function (err, dcladmin) {
    if (err) {
      console.log("Error In Getting Admin");
      throw err;
    } else {
      CreateRoles(function(err) {
       if (err) {
         console.log("Error creating roles");
         throw err;
       } else {
         CreateAdminRoleMapping(function(err) {
         });
       }
      });
    }
  });


    //send password reset link when requested
    User.on('resetPasswordRequest', function(info) {
      var url = 'http://' + config.host + ':' + config.port + '/index.html#/resetpassword';
      var html = 'Click <a href="' + url + '?access_token=' + 
        info.accessToken.id + '">here</a> to reset your password';
      console.log(html);
      console.log("Sending Reset Password to Email: ", info);
      User.app.models.Email.send({
        to: info.email,
        from: "dclweb@yahoo.com",
        subject: 'Password reset',
        html: html
      }, function(err) {
        if (err) return console.log('> error sending password reset email');
        console.log('> sending password reset email to:', info.email);
      });
    });

  /* Creates an Admin if Needed */
  function CreateAdminIfNeeded(done) {
    var admin_cred = {email: 'admin@dcl.com', password: 'admin123'};
    User.findOrCreate({"where": {email: 'admin@dcl.com'}}, admin_cred, function (err, user) {
      if (err || !user) {
        console.log("Error creating dcladmin user");
      } else {
        console.log("Created dcladmin");
      }

      admin_user = user;
      var new_player = {'firstName': "DCL", 'lastName': "Admin",  'userId': user.id, 'created': Date.now()};
      Player.findOrCreate({"where": {userId: user.id}}, new_player, function(err, player) {
        if (err || !player) {
          console.log("Error Creating Admin Player");
          throw err;
        } else {
          done(null, player);
        }
      })
    });
  }

 /* Create Role if not already created */
 function CreateRoleIfNeeded(role, callback) {

   Role.findOrCreate({where: {"name": role}}, {name: role}, function(err, r) {
     if (err) {
       console.log("Error in findOrCreate role : ", role);
     } else {
       console.log("Role Created : ", role);
     }
     callback(err, r);
   });
 }


/*
 * Creates various roles needed by DCL
 * dcladmin, teamadmin, itadmin
 */

 function CreateRoles(done) {
   async.series([
    function(callback) {
      CreateRoleIfNeeded("dcladmin", callback);
    },
    function(callback) {
      CreateRoleIfNeeded("teamadmin", callback);
    }
   ], function(err, results) {
      if (err) {
        console.log("Not all roles created: ", results.length);
      }
      done(err, results);
   });
 }

  function CreateAdminRoleMapping() {
    console.log("CreateAdminRoleMapping");
    Role.findOne({where: {name: "dcladmin"}}, function(err, role) {
      if (err || !role) {
        console.log("Error: Strange, could not find dcladmin role");
        throw err;
      } else {
          role.principals.findOne({where: {roleId: role.id}}, function(err, p1) {
            if (!p1) {
              role.principals.create({principalType: RoleMapping.USER, principalId: admin_user.id}, function(err, p2) {
                if (err) {
                  throw err;
                }
                console.log("Created a principal ", p2);
              });
            } else {
              console.log("Found the principal: ", p1);
            }
          });
        }
    });
  }
};