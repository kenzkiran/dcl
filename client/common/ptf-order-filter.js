module.exports = function() {
    return function(input) {
        if (parseInt(input) === 1) {
            return '1st';
        }
        if (parseInt(input) === 2) {
            return '2nd';
        }
        if (parseInt(input) === 3) {
            return '3rd';
        }
        if (parseInt(input) === 4) {
            return '4th';
        }
        return input;
    };
};

