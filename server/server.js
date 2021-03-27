var loopback = require('loopback');
var bodyParser = require('body-parser');
var boot = require('loopback-boot');
var log = require('./utils/logger.js')();
var cookieParser = require('cookie-parser');
var path = require('path');


log.trace('*******************************************');
log.trace('          DCL Server Started !!!    ');
log.trace('*******************************************');

var app = module.exports = loopback();
app.use(require('serve-favicon')(path.resolve(__dirname, "./assets/favicon.png")));
app.middleware('initial', bodyParser.urlencoded({ extended: true }));

//app.use(bodyParser.urlencoded({extended: true}));

// -- Add your pre-processing middleware here --
// This is needed for cookies
app.use(cookieParser('mysuru'));
// Use the token in the cookie and associate it with a model..
//app.use(loopback.token({ model: app.models.accessToken }));
app.use(loopback.token({cookies: ['authorization']}));


// boot scripts mount components like REST API
boot(app, __dirname);

// -- Mount static files here--
app.use(loopback.static(path.resolve(__dirname, './public')));
app.use(loopback.static(path.resolve(__dirname, '../dist')));
app.use(loopback.static(path.resolve(__dirname, '../client/dist')));

// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
app.use(loopback.urlNotFound());

app.start = function() {
    // start the web server
    return app.listen(function() {
        app.emit('started');
        log.info('Web server listening at: %s', app.get('url'));
    });
};

// start the server if `$ node server.js`
if (require.main === module) {
    app.start();
}
