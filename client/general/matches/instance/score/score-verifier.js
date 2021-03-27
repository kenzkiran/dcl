var ScoreIssues = require('./score-issues').ScoreIssues;
var IssueTypes = require('./score-issues').IssueTypes;

module.exports = ['$log', function($log) {
    function verifyInning(inning) {
        var scoreIssues = new ScoreIssues();
        $log.debug('Verifying: ' + inning.order);
        var prefix = 'Inning ' + inning.order + ' ';
        var bts = inning.battingScores;
        var bws = inning.bowlingScores;
        var btsNames = [];
        for (var i = 0; i < bts.length; ++i) {
            if (bts[i] && bts[i].batsman && bts[i].batsman.id) {
                btsNames.push(bts[i].batsmanName());
            }
        }

        if (btsNames.length < inning.numPlayers) {
            var issue = new IssueTypes.OutOfBound(prefix + ' Number of Batsmen: ', btsNames.length, 'equal', inning.numPlayers);
            scoreIssues.addIssue(issue);
        }

        var repeated = [];
        if (btsNames.length >= 2) {
            btsNames = btsNames.sort();
            for (var i = 0; i < btsNames.length - 1; ++i) {
                if (btsNames[i] === btsNames[i + 1]) {
                    repeated.push(btsNames[i]);
                }
            }
        }
        if (repeated.length) {
            var issue = new IssueTypes.Duplicate(prefix + ' Batsmen', JSON.stringify(repeated));
            scoreIssues.addIssue(issue);
        }

        var bwsNames = [];
        var totalOvers = 0;
        for (var i = 0; i < bws.length; ++i) {
            if (bws[i] && bws[i].bowler && bws[i].bowler.id) {
                totalOvers += bws[i].overs;
                bwsNames.push(bws[i].bowlerName());
            }
        }

        if (totalOvers > inning.maxOvers) {
            var issue = new IssueTypes.OutOfBound(prefix + ' Sum of bowler overs:', totalOvers, 'upper', inning.maxOvers);
            scoreIssues.addIssue(issue);
        }

        if (bwsNames.length < 1) {
            var issue = new IssueTypes.OutOfBound(prefix + ' Number of Bowlers: ', 0, 'lower', 0);
            scoreIssues.addIssue(issue);
        }
        repeated = [];
        if (bwsNames.length >= 2) {
            bwsNames = bwsNames.sort();
            for (var i = 0; i < bwsNames.length - 1; ++i) {
                if (bwsNames[i] === bwsNames[i + 1]) {
                    repeated.push(bwsNames[i]);
                }
            }
        }

        if (repeated.length) {
            var issue = new IssueTypes.Duplicate(prefix + ' Bowlers', JSON.stringify(repeated));
            scoreIssues.addIssue(issue);
        }
        return scoreIssues;
    }


    function verifyMatchStatus(inning1, inning2, match) {
        var scoreIssues = new ScoreIssues();
        // check for totals
        $log.debug('Verifying Match Status');
        if (inning2.scoreTotals.total > (inning1.scoreTotals.total + 6)) {
            var issue = new IssueTypes.General('Inning 2 total far exceeds Inning 1 total');
            scoreIssues.addIssue(issue);
        }

        if (match.status !== 'Abandoned') {
            if (inning1.scoreTotals.total === inning2.scoreTotals.total) {
                if (match.status !== 'Tie') {
                    var issue = new IssueTypes.General('Totals same, but match result not a "Tie"');
                    scoreIssues.addIssue(issue);
                }
            } else {
                if (match.status === 'Won') {
                    $log.info("Scores: ", inning1.getTotal(), inning2.getTotal());
                    if (inning1.getTotal() > inning2.getTotal() && match.getWinningTeam().id !== inning1.battingTeam.id) {
                        scoreIssues.addIssue(new IssueTypes.General('Inning 1 total > Inning 2 total, So based on scores Winner should be: ' + inning1.battingTeam.name));
                    } else if (inning2.getTotal() > inning1.getTotal() && match.getWinningTeam().id!== inning2.battingTeam.id) {
                        scoreIssues.addIssue(new IssueTypes.General('Inning 2 total > Inning 1 total, So based on scores, Winner should be: ' + inning2.battingTeam.name));
                    }
                } else {
                    scoreIssues.addIssue(new IssueTypes.General('Scores are different, but Result is a Tie !!'));
                }
            }
        }
        return scoreIssues;
    }

    return {
        verifyInning: verifyInning,
        verifyMatchStatus: verifyMatchStatus
    };
}];