module.exports = function($resource, $log, DclCommon) {
    var resourceUrl = DclCommon.baseUrl + 'ScoreSheets/:id';
    var Resource = $resource(resourceUrl, {id: '@id'}, {update: {method: 'PUT'}});


    var getMatchScoreSheet = function(matchId) {
        var whereFilter = {matchId: matchId};
        var params = {
            filter: {where: whereFilter}
        };
        return Resource.query(params).$promise;
    };

    var upsertScoreSheet = function(scoreSheet, cb) {
        $log.info("Upserting ScoreSheet for matchId:", scoreSheet.matchId);
        return upsertOrSubmitScoreSheet(false, scoreSheet, cb);
    };

    var submitScoreSheet = function(scoreSheet, cb) {
        $log.info("Submitting ScoreSheet for matchId:", scoreSheet.matchId);
        return upsertOrSubmitScoreSheet(true, scoreSheet, cb);
    };


    var upsertOrSubmitScoreSheet = function(shouldSubmit, scoreSheet, cb) {
        var s = new Resource();
        s.matchId = scoreSheet.matchId;
        s.saved = new Date();
        s.status = 'saved';
        if (shouldSubmit) {
            s.status = 'submit';
        }
        s.score = scoreSheet.score;
        console.log('Scoresheet UpsertOrSubumit');
        console.log(s);
        if (scoreSheet.id) {
            s.id = scoreSheet.id;
            return s.$update(cb);
        }
        s.$save(cb);
    };


    return {
        promise: Resource.$promise,
        getMatchScoreSheet: getMatchScoreSheet,
        upsertScoreSheet: upsertScoreSheet,
        submitScoreSheet: submitScoreSheet
    };
};
