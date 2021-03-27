/**
 * Created by rramachandra on 2016-06-29.
 */
var playerToId = require('./score-utils').playerToId;

function BattingScore(bs) {
    bs = bs || {};
    this.id = bs.id || undefined;
    this.batsmanId = bs.batsmanId || '';
    this.batsman = bs.batsman || '';
    this.fielder = bs.fielder || '';
    this.bowler = bs.bowler || '';
    this.status = bs.status || 'DNB';
    this.balls = bs.balls || 0;
    this.runs = bs.runs || 0;
    this.four = bs.four || 0;
    this.six = bs.six || 0;
    this.avg = bs.avg || 0.0;
    this.sequence = bs.sequence || 0;
}

BattingScore.prototype = {
    flatten: function (validOnly) {
        validOnly = validOnly || false;
        var acopy = angular.copy(this);
        acopy.batsmanId = playerToId(acopy.batsman);
        if (validOnly && !acopy.batsman) {
            return '';
        }
        acopy.fielderId = playerToId(acopy.fielder);
        acopy.bowlerId = playerToId(acopy.bowler);
        return acopy;
    },
    batsmanName: function() {
        if (this.batsman) {
            return this.batsman.firstName + ' ' + this.batsman.lastName;
        }
    },
    fielderName: function() {
        if (this.fielder) {
            return this.fielder.firstName + ' ' + this.fielder.lastName;
        }
    },
    bowlerName: function() {
        if (this.bowler) {
            return this.bowler.firstName + ' ' + this.bowler.lastName;
        }
    }
};

module.exports = BattingScore;
