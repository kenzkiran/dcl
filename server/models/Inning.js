var log = require('../utils/logger.js')();
module.exports = function(Inning) {
    log.info("Inside Inning Model");

    /***
     * Cleanup all battingScores and  bowlingScores
     */
    Inning.prototype.cleanUp = function(cb) {
        log.info("Inning Cleaning up: " + this.id);
        var self = this;
        log.info("Destroying all batting scores");
        var errorList = [];
        self.batting.destroyAll(function(err) {
            if (err) {
                log.error("Error in inning.batting.destroyAll", err);
                errorList.push(err);
            }
            log.info("Destroying all bowling scores");
            self.bowling.destroyAll(function(err) {
                if(err) {
                    log.error("Error in inning.bowling.destroyAll", err);
                    errorList.push(err);
                }
                if (errorList.count) {
                    return cb(new Error("Error in cleanMatchInning", errorList));
                }
                return cb(null);
            });
        });
    };
};