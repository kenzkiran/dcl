'use strict';
module.exports = function($resource, DclCommon) {
    console.log('Resource: Match: ' + DclCommon.baseUrl);
    var resourceUrl = DclCommon.baseUrl + 'Matches/:id/:action';
    var Resource = $resource(resourceUrl, {id: '@id'}, {update: {method: 'PUT'}});
    var includeFilter = ["teamOne", "teamTwo", "umpireOne", "umpireTwo", "ground"];

    var getMatches = function() {
        var params = {
            filter: {include: includeFilter}
        };
        return Resource.query(params).$promise;
    };

    var getMatch = function(matchId) {
        return Resource.get({id: matchId, filter: {include: includeFilter}}).$promise;
    };

    var getTournamentMatches = function(tourneyId, orderFilter) {
        var whereFilter = {tournamentId: tourneyId};
        var params = {
            filter: {
                include: includeFilter,
                where: whereFilter
            }
        };

        if (orderFilter) {
            params.filter.order = orderFilter;
        }

        return Resource.query(params).$promise;
    };

    var upsertMatch = function(tournamentId, newMatch) {
        var m = new Resource();
        m.date = newMatch.date;
        m.tournamentId = tournamentId;
        m.teamOneId = newMatch.teamOne.id;
        m.teamTwoId = newMatch.teamTwo.id;
        m.umpireTwoId = newMatch.umpireTwo.id;
        m.umpireOneId = newMatch.umpireOne.id;
        m.groundId = newMatch.ground.id;
        m.lock = newMatch.lock;
        if (newMatch.id) {
            m.id = newMatch.id;
            return m.$update();
        }
        return m.$save();
    };

    var getScoreSheet = function(matchId) {
        return Resource.get({id: matchId, action: 'scoreSheet'}).$promise;
    };

    return {
        getMatch: getMatch,
        getMatches: getMatches,
        getTournamentMatches: getTournamentMatches,
        upsertMatch: upsertMatch,
        getScoreSheet: getScoreSheet,
        // In case some place we need to really access tournament Resource
        Resource: Resource
    };
};
