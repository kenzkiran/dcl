'use strict';
module.exports = function ($resource, DclCommon, $cookies) {
    console.log('Resource: Players: ' + DclCommon.baseUrl);

    var includeFilter = ["teams"];
    var whereFilter = {
        "active": true
    };

    var resourceUrl = DclCommon.baseUrl + 'Players/:id/:verb';
    var Resource = $resource(resourceUrl, { id: '@id', verb: '@verb' }, {
        update: { method: 'PUT' }
    });

    var getPlayers = function () {
        return Resource.query({ filter: { include: includeFilter } }).$promise;
    };

    var getActivePlayers = function () {
        return Resource.query({ filter: { include: includeFilter, where: whereFilter } }).$promise;
    };

    var getPlayer = function (playerId) {
        return Resource.get({ id: playerId }).$promise;
    };

    var getPlayerByUserId = function (userId) {
        var userIdFilter = { "userId": userId };
        return Resource.query({ filter: { include: includeFilter, where: userIdFilter } }).$promise;
    };

    var getPlayerStats = function (playerId) {
        return Resource.get({ id: playerId, verb: 'stats' }).$promise;
    };

    var getPlayersByFilter = function (filter) {
        return Resource.query({ filter: filter }).$promise;
    };

    var getPlayerByEmail = function(email) {
        return Resource.query({verb:'findbyemail', email:email}).$promise;
    }

    var signUp = function (new_player_info, cb) {
        //console.log("New player info: ", new_player_info);
        var newPlayer = new Resource({ verb: 'signup' });
        newPlayer.info = new_player_info;
        return newPlayer.$save(function (user) {
            cb(null, user);
        }, function (res) {
            console.log("Signup Res  :", res);
            cb(res.data.error, null);
        });
    };

    var signIn = function (credentials, cb) {
        var playerCredentials = new Resource({ verb: "signIn" });
        playerCredentials.cred = credentials;
        playerCredentials.$save().then(function (res) {
            cb(res);
        }).catch(function (err) {
            cb(null, err);
        });
    };

    var signOut = function (userId, cb) {
        console.log("Player Signout");
        var playerCredentials = new Resource({ verb: "signOut" });
        playerCredentials.$save().then(function (res) {
            console.log("signout successfull");
            cb(null, res);
        }).catch(function (err) {
            console.log("signout failed");
            cb(err);
        });
    };


    var getCookieUserId = function () {
        var userId = undefined;
        userId = $cookies.get('userid');
        // cookie strings always show up with "j:<user id>"
        var index = userId && userId.indexOf("j:");
        if (index >= 0) {
            userId = userId.substr(2);
            // remove the additional "" in the beginning and end
            if (userId) {
                userId = userId.split('"').join('');
            }
        }
        return userId;
    };

    var removePlayerFromTeam = function (playerId, teamId, cb) {
        if (!playerId || !teamId) {
            return cb(new Error("No playerId or teamId "));
        }
        var playerRes = new Resource({ verb: "removeTeamById" });
        playerRes.id = playerId;
        playerRes.teamId = teamId;
        playerRes.$save().then(function (res) {
            console.log("Remove Player to team Success");
            cb(null, res);
        }).catch(function (err) {
            console.log("Remove Player to team failed ");
            cb(err);
        });
    }

    var addPlayerToTeam = function (playerId, teamId, cb) {
        if (!playerId || !teamId) {
            return cb(new Error("No playerId or teamId "));
        }
        var playerRes = new Resource({ verb: "addTeamById" });
        playerRes.id = playerId;
        playerRes.teamId = teamId;
        playerRes.$save().then(function (res) {
            console.log("Add Player to team Success");
            cb(null, res);
        }).catch(function (err) {
            console.log("Add Player to team failed ");
            cb(err);
        });
    }

    var upsertPlayer = function (newPlayer, cb) {
        if (!newPlayer.id) {
            return cb(Error("No Player Id found"));
        }
        var playerRes = new Resource({ verb: "updateProfile" });
        var p = {};
        p.id = newPlayer.id;
        p.firstName = newPlayer.firstName;
        p.lastName = newPlayer.lastName;
        p.battingStyle = newPlayer.battingStyle;
        p.bowlingStyle = newPlayer.bowlingStyle;
        p.isWicketKeeper = newPlayer.isWicketKeeper;
        p.active = newPlayer.active;
        if (newPlayer.approved !== undefined) {
            p.approved = newPlayer.approved;
        }
        if (newPlayer.certified !== undefined)
            p.certified = newPlayer.certified;
        if (newPlayer.certLevel !== undefined) {
            p.certLevel = newPlayer.certLevel;
        }
        p.designation = newPlayer.designation;
        playerRes.info = p;
        playerRes.$save().then(function (res) {
            console.log("Update Success");
            cb(null, res);
        }).catch(function (err) {
            console.log("Update failed");
            cb(err);
        });
    };

    var getTotalCount = function (wherefilter) {
        var resourceUrl1 = DclCommon.baseUrl + 'Players/Count';
        var resource1 = $resource(resourceUrl1);

        if (wherefilter !== undefined && whereFilter !== null) {
            return resource1.get({ where: wherefilter }).$promise;
        } else {
            return resource1.get().$promise;
        }
    };

    var getAdminList = function (id) {
        return Resource.get({ 'id': id, verb: 'adminlist' }).$promise;
    }

    var getPersonalDetails = function (id) {
        return Resource.get({ 'id': id, verb: 'personalDetails' }).$promise;
    }

    var changePassword = function (info, cb) {
        var playerChangePassword = new Resource({ verb: 'changePassword' });
        playerChangePassword.info = info;
        playerChangePassword.$save().then(function (res) {
            console.log("Change Password Success");
            cb(null, res);
        }).catch(function (err) {
            console.log("Change Password failed ");
            cb(err);
        });
    }

    var resetPassword = function (info, cb) {
        var playerResetPassword = new Resource({ verb: 'resetpassword' });
        playerResetPassword.info = info;
        playerResetPassword.$save().then(function (res) {
            console.log("Reset Password Success");
            cb(null, res);
        }).catch(function (err) {
            console.log("Reset Password failed ");
            cb(err);
        });
    }

    var RequestResetPassword = function (email, cb) {
        console.log("Ravi Sending Reset Password");
        var playerResetPassword = new Resource({verb: 'requestresetpassword' });
        playerResetPassword.email = email;
        playerResetPassword.$save().then(function (res) {
            console.log("Reset password success");
            cb(null, res);
        }).catch(function (err) {
            console.log("Reset password failure");
            cb(err);
        });
    }

    return {
        removePlayerFromTeam: removePlayerFromTeam,
        addPlayerToTeam: addPlayerToTeam,
        getCookieUserId: getCookieUserId,
        getPlayerByUserId: getPlayerByUserId,
        signOut: signOut,
        signIn: signIn,
        signUp: signUp,
        getPlayers: getPlayers,
        getPlayer: getPlayer,
        upsertPlayer: upsertPlayer,
        getActivePlayers: getActivePlayers,
        getPlayersByFilter: getPlayersByFilter,
        getPlayerByEmail: getPlayerByEmail,
        getTotalCount: getTotalCount,
        getPlayerStats: getPlayerStats,
        getAdminList: getAdminList,
        getPersonalDetails: getPersonalDetails,
        changePassword: changePassword,
        RequestResetPassword: RequestResetPassword,
        resetPassword: resetPassword,
        Resource: Resource,
    };
};
