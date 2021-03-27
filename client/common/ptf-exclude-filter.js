module.exports = function() {
    function compareKey(a, b, key) {
        return a[key] === b[key];
    }

    function shouldExclude(item, excludeList, key) {
        for (var j = 0; j < excludeList.length; ++j) {
            if (key) {
                // if it has a key, compareKey
                if (compareKey(item, excludeList[j], key)) {
                    return true;
                }
            } else {
                // else simple === comparison
                if (item === excludeList[j]) {
                    return true;
                }
            }
        }
        return false;
    }


    /* This filter will return an output items removing the items from exclusion list
     * @param input: should be an array of input items
     * @param exclude:  should be an array of items containing exclusion list
     * @param key, Optional, if available will do an object.key compare, else a straight === compare
     */
    var excludeFilter = function(input, exclude, key) {
        var output = [];
        if (input && input instanceof Array && input.length > 0) {
            // we need an array for excluded items
            if (!(exclude instanceof Array)) {
                exclude = [exclude];
            }
            for (var i = 0; i < input.length; ++i) {
                if (!shouldExclude(input[i], exclude, key)) {
                    output.push(input[i]);
                }
            }
        }
        return output;
    };

    return excludeFilter;
};