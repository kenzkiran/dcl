

function IssueGeneral(details, type) {
    this.type = type || "General";
    this.details = details;
    this.toMessage = function() { return '' + this.type + ':' + this.details; };
}

function IssueOutOfBound(entity, value, bound, range) {
    IssueGeneral.call(this, {entity: entity, value: value, bound: bound, range: range}, 'OutOfBound');
    this.toMessage = function () {
        var range;
        if (this.details.bound === 'upper') {
            range = '< ' + this.details.range;
        } else if (this.details.bound === 'lower') {
            range = '> ' + this.details.range;
        } else if (this.details.bound === 'equal' ) {
            range = '=' + this.details.range;
        } else {
            range = 'within (' + this.details.range.min + ' to ' + this.details.range.max + ')';
        }
        return 'Out of Bound: ' + this.details.entity + ' is ' +  this.details.value +  ' expected: ' + range;
    };
}


function IssueDuplicate(entity, entry) {
    IssueGeneral.call(this, {entity: entity, entry: entry});
    this.toMessage = function() {
        return 'Duplicate entry for: ' + this.details.entity + ':' + this.details.entry;
    };
}

//TODO: Need to develop an extensive issue system
function ScoreIssues() {
    this.issues = [];
}

ScoreIssues.prototype = {
    addIssue: function(issue) {
        this.issues.push(issue);
        console.log("Issue pushed: " + issue.toMessage());
    },
    clear: function() {
        this.issues = [];
    },
    concatIssues: function(scoreIssues) {
        this.issues = this.issues.concat(scoreIssues.issues);
    }
};

module.exports = {
    ScoreIssues: ScoreIssues,
    IssueTypes: {
        General: IssueGeneral,
        OutOfBound: IssueOutOfBound,
        Duplicate: IssueDuplicate
    }
};