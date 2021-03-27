/**
 * Created by rramachandra on 2016-06-29.
 */

var playerToId = require('./score-utils').playerToId;

function BowlingScore(bs) {
    bs = bs || {};
    this.id = bs.id || undefined;
    this.bowlerId = bs.bowlerId || '';
    this.bowler = bs.bowler || '';
    this.overs = bs.overs || 0;
    this.balls = bs.balls || 0;
    this.maidens = bs.maidens || 0;
    this.runs = bs.runs || 0;
    this.wickets = bs.wickets || 0;
    this.wides = bs.wides || 0;
    this.noballs = bs.noballs || 0;
    this.four = bs.four || 0;
    this.six = bs.six || 0;
    this.economy = bs.economy || 0;
    this.sequence = bs.sequence || 0;
}

BowlingScore.prototype = {
    flatten: function (validOnly) {
        validOnly = validOnly || false;
        var acopy = angular.copy(this);
        acopy.bowlerId = playerToId(acopy.bowler);
        if (validOnly && !acopy.bowlerId) {
            return '';
        }
        acopy.economy = acopy.runs / ((acopy.overs * 6 + acopy.balls) / 6.0);
        return acopy;
    },
    bowlerName: function() {
        if (this.bowler) {
            return this.bowler.firstName + ' ' +this.bowler.lastName;
        }
    }
};
module.exports = BowlingScore;

