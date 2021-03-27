var _ = require('underscore');
var log = require('./logger.js')();

var INDETERMINATE = '-.-';

/***************************
 * Utility Functions
 * *************************/


var calculateFieldingStats = function(fieldingScores ) {
    // per innings fielding stats
    var inningFieldStat = {
        runouts: 0,
        catches: 0,
        stumps: 0
    };

    var rawStats = {
        totalRunouts: 0,
        totalCatches: 0,
        totalStumps: 0,
        total: 0,
        best : _.clone(inningFieldStat),
        fives: 0
    };

    if (!fieldingScores || fieldingScores.length == 0) {
        return rawStats;
    }

    if (!_.isArray(fieldingScores)) {
        fieldingScores = [fieldingScores];
    }

    // inningsMap contains the following structure:
    /*
        {
            id: id  // the inning id
            fieldingScores: [] //array -> the array of fielding score belong to this innings
            stats : {} //object as described in inningStats above
        }
     */
    var inningsMap = [];
    // put each fieldingScore into innings map buckets
    for(var i = 0; i < fieldingScores.length; ++i) {
        var fs = fieldingScores[i];
        var found = _.find(inningsMap, function(inning) {
                return inning.id.toString() === fs.inningId.toString()
            });

        if (!found) {
            // create new one
            found = {id: fs.inningId,
                    fieldingScores: [],
                    stats: _.clone(inningFieldStat)
            };
            inningsMap.push(found);
        }

        found.fieldingScores.push(fs);
        var stats = found.stats;

        if (fs.status === 'stumped') {
            stats.stumps += 1;
        }
        if (fs.status === 'caught') {
            stats.catches += 1;
        }
        if (fs.status === 'runout') {
            stats.runouts += 1;
        }
    }


    var best = undefined;
    for(var i = 0; i < inningsMap.length; ++i) {
        var inning = inningsMap[i];
        var inningStat = inning.stats;
        log.info("Inning rawstats: ", inningStat);
        if (!best) {
            best = inningStat;
        } else {
            if (inning.fieldingScores.length >= (best.runouts + best.catches + best.stumps)) {
                best = inning.stats;
            }
        }

        rawStats.totalCatches += inningStat.catches;
        rawStats.totalStumps += inningStat.stumps;
        rawStats.totalRunouts += inningStat.runouts;

        if (inning.fieldingScores.length >= 5)
            rawStats.fives += stats.fives;

    }
    rawStats.total = rawStats.totalCatches + rawStats.totalStumps + rawStats.totalRunouts;

    log.info("Fielding rawstats: ", rawStats);
    rawStats.best = _.clone(best);

    return rawStats;
};
/***
 * Calculate Bowling Stats for a given bunch of bowling scores
 * @param bowlingScores
 * @return object - Bowling Stats object
 */
var calculateBowlingStats = function(bowlingScores) {

    var rawStats = {
        totalBalls: 0,
        totalWickets: 0,
        totalRuns: 0,
        total5wickets: 0,
        totalDots: 0,
        totalMaidens: 0,
        totalNoballs: 0,
        totalSixes: 0,
        totalWides:0,
        topBowling: undefined
    };

    if (!bowlingScores) {
        return rawStats;
    }

    if (!_.isArray(bowlingScores)) {
        bowlingScores = [bowlingScores];
    }

    if (bowlingScores.length === 0) {
        return rawStats;
    }

    for(var i = 0; i < bowlingScores.length; ++i) {
        var bs = bowlingScores[i];
        rawStats.totalBalls +=  (bs.overs * 6 + bs.balls);
        rawStats.totalWickets += bs.wickets;
        rawStats.totalDots += bs.dots;
        rawStats.totalRuns += bs.runs;
        rawStats.totalMaidens += bs.maidens;
        rawStats.totalWides += bs.wides;
        rawStats.totalNoballs += bs.noballs;
        rawStats.totalSixes += bs.six;

        if (i === 0) {
            rawStats.topBowling = bs;
        }

        if(bowlingScoreComparator(bs, rawStats.topBowling)) {
            rawStats.topBowling = bs;
        }

        if (bs.wickets >= 5) {
            rawStats.total5wickets++;
        }
    }

    rawStats.economyRate = parseFloat(rawStats.totalRuns/(rawStats.totalBalls/6.0)).toFixed(2);

    rawStats.average = parseFloat(rawStats.totalRuns/rawStats.totalWickets).toFixed(2);

    rawStats.best = rawStats.topBowling.wickets + "/" + rawStats.topBowling.runs;

    if(isNaN(rawStats.economyRate) || !_.isFinite(rawStats.economyRate)) {
        rawStats.economyRate = INDETERMINATE;
    }

    if(isNaN(rawStats.average) || !_.isFinite(rawStats.average)) {
        rawStats.average = INDETERMINATE;
    }
    return rawStats;
};

/***
 * Calculates batting stats given a set of batting scores
 * @param battingScores - Array of batting scores
 * @return object - Batting Stats object
 */
var calculateBattingStats = function(battingScores) {

    var rawStats = {
        totalRuns : 0,
        totalBalls: 0,
        totalMatches: 0,
        totalInnings: 0,
        totalDNBs: 0,
        totalFours: 0,
        totalSixes: 0,
        topScore: undefined,
        totalNotOuts: 0,
        totalHundreds: 0,
        totalFifties: 0
    };

    if (!battingScores) {
        return rawStats;
    }

    if (!_.isArray(battingScores)) {
        battingScores = [battingScores];
    }

    if (battingScores.length === 0) {
        return rawStats;
    }

    for(var i = 0; i < battingScores.length; ++i) {
        var bs = battingScores[i];

        if (i == 0) {
            rawStats.topScore = bs;
        }

        // skip any DNB
        if (bs.status === 'DNB') {
            continue;
        }
        rawStats.totalRuns += bs.runs;
        rawStats.totalBalls += bs.balls;
        rawStats.totalFours += bs.four;
        rawStats.totalSixes += bs.six;

        if (bs.status !== 'NotOut') {
            rawStats.totalInnings += 1;
        }

        if (battingScoreComparator(bs, rawStats.topScore)) {
            rawStats.topScore = bs;
        }

        if(bs.status === 'NotOut') {
            rawStats.totalNotOuts++;
        }

        if(bs.runs > 50) {
            if (bs.runs > 100) {
                rawStats.totalHundreds++;
            } else {
                rawStats.totalFifties++;
            }
        }

    }
    rawStats.totalMatches = battingScores.length;
    rawStats.strikeRate = 100.0 * parseFloat(rawStats.totalRuns)/(rawStats.totalBalls > 0 ? rawStats.totalBalls : 1);
    rawStats.average = parseFloat(rawStats.totalRuns)/(rawStats.totalInnings > 0 ? rawStats.totalInnings : 1.0);
    rawStats.strikeRate = rawStats.strikeRate.toFixed(2);
    rawStats.average = rawStats.average.toFixed(2);
    return rawStats;
};

/**
 * Compare two batting Stats
 * @param b1
 * @param b2
 * @returns {number}: -1 implies b1 goes before b2, +1 implies b2 goes before b1, 0 is same
 */
function battingStatsComparator(b1, b2) {
    // compare totalRuns
    if (b1.totalRuns > b2.totalRuns) {
        return -1;
    }
    if (b1.totalRuns < b2.totalRuns) {
        return 1;
    }

    // if we are here implies runs are same, compae average
    if (b1.average > b2.average) {
        return -1;
    }
    if (b1.average < b2.average) {
        return 1;
    }

    // if we are here implies averages are same, compare matches played
    if (b1.totalMatches < b2.totalMatches) {
        return -1;
    }
    if (b1.totalMatches > b2.totalMatches) {
        return 1;
    }
    return 0;
}

/**
 * Compare two bowling stats and order them.
 * @param b1 bowling score 1
 * @param b2 bowling score 2
 * @returns {number} : -1 implies b1 goes before b2, +1 implies b2 goes before b1, 0 is same
 */
function bowlingStatsComparator(b1, b2) {
    // compare wickets
    if (b1.totalWickets > b2.totalWickets) {
        return -1;
    }
    if (b1.totalWickets < b2.totalWickets) {
        return 1;
    }

    if (b1.average < b2.average) {
        return -1;
    }

    if (b2.average < b1.average) {
        return 1;
    }

    return 0;
}

/***
 * Compare two batting scores
 * @param b1 - battingScore 1
 * @param b2 - battingScore 2
 * @returns {number} -1 if b1 goes before b2, +1 implies b2 goes before b1, 0 is same
 */
function battingScoreComparator(b1, b2) {
    if (b1.runs > b2.runs) {
        return -1;
    }

    if (b2.runs > b1.runs) {
        return 1;
    }

    // if we are here then runs are same, lets compare balls
    if (b1.balls < b2.balls) {
        return -1;
    }

    if (b2.balls < b2.balls) {
        return 1;
    }
    return 0;
}

function bowlingScoreComparator(b1, b2) {
    if (b1.wickets > b2.wickets) {
        return -1;
    }

    if (b2.wickets > b1.wickets) {
        return -1;
    }

    if (b1.runs < b2.runs) {
        return -1;
    }

    if (b2.runs < b1.runs) {
        return 1
    }
    return 0;
}

/******  END OF UTILITY FUNCTIONS *************/

module.exports = {
    'calculateBowlingStats': calculateBowlingStats,
    'calculateFieldingStats': calculateFieldingStats,
    'bowlingStatsComparator': bowlingStatsComparator,
    'bowlingScoreComparator': bowlingScoreComparator,
    'calculateBattingStats': calculateBattingStats,
    'battingStatsComparator': battingStatsComparator,
    'battingScoreComparator': battingScoreComparator,
    'INDETERMINATE': INDETERMINATE
};