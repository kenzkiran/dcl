var log = require('../utils/logger.js')();


module.exports = function(BowlingScore) {
    log.info("Inside BowlingScore Model");

    BowlingScore.observe('before save', function updateTimestamp(ctx, next) {
        log.info("Bowling Score: ", ctx.data);
        next();
    });
};
