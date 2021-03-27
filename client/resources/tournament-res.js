module.exports = function($resource, DclCommon, $cookies) {
    console.log('Resource: Tournaments: ' + DclCommon.baseUrl);
    var resourceUrl = DclCommon.baseUrl + 'Tournaments/:id/:verb';
    var penaltyResourceUrl = DclCommon.baseUrl + 'Penalties/:id';
    var queryFilter = {
        include: ["teams"]
    };


    var Resource = $resource(resourceUrl, {id: '@id'},
      {update: {method: 'PUT'}});
    var PenaltyResource = $resource(penaltyResourceUrl, {id: '@id'}, {update: {method: 'PUT'}});

    var getTournaments = function(orderFilter) {
        var filter = { include: queryFilter["include"]};
        if (orderFilter) {
            filter.order = orderFilter;
        }
        return Resource.query({filter: filter}).$promise;
    };

    var getTourney = function(tourneyId) {
        return Resource.get({id: tourneyId, filter: queryFilter}).$promise;
    };

    var getPenaltiesForTournament = function(tourneyId) {
        return Resource.get({id: tourneyId, verb:'getPenalties'}).$promise;
    };

    var addPenaltyForTeam = function(tourneyId, teamId, penalty, done) {
        return Resource.save({id: tourneyId, verb:'addPenalty'}, {teamId:teamId, penalty: penalty},
            function() { done(null); }, // success
            function(res){ done(res);} // failure
        );
    };


    var removePenalty = function(penaltyId, done) {
        return PenaltyResource.remove({id: penaltyId},
            function() { done(null);},
            function(err) {done(err);}
        );
    };


    var getTourneyStats = function(tourneyId) {
        return Resource.get({id: tourneyId, verb:'stats'}).$promise;
    };


    var addTeamToTourney = function(tourneyId, teamId, done) {
        return Resource.save({id: tourneyId, verb:'addTeamById'}, {'teamId': teamId},
            function() { done(null); }, // success
            function(res){ done(res);} // failure
        );
    };

    var removeTeamFromTourney = function(tourneyId, teamId, done) {
        return Resource.save({id: tourneyId, verb:'removeTeamById'}, {'teamId': teamId},
            function() { done(null); }, // success
            function(res){ done(res);} // failure
        );
    };

    var upsertTournament = function(newTourney) {
        var t = new Resource();
        t.name = newTourney.name;
        t.startDate = newTourney.startDate;
        t.tourneyType = newTourney.tourneyType;
        t.ageGroup = newTourney.ageGroup;
        t.division = newTourney.division;
        t.status = newTourney.status;
        t.gender = newTourney.gender;
        t.matchType = newTourney.matchType;
        t.gameType = newTourney.gameType;
        if (newTourney.id) {
            t.id = newTourney.id;
            return t.$update();
        }
        // new tournament's without ids are created
        return t.$save();
    };

    return {
        removePenalty: removePenalty,
        addPenaltyForTeam: addPenaltyForTeam,
        getPenaltiesForTournament : getPenaltiesForTournament,
        removeTeamFromTourney: removeTeamFromTourney,
        addTeamToTourney: addTeamToTourney,
        getTourney: getTourney,
        getTourneyStats: getTourneyStats,
        getTournaments: getTournaments,
        upsertTournament: upsertTournament,
        // In case some place we need to really access tournament Resource
        Resource: Resource
    };
};

