var pjson = require('../package.json');
var config = require('config');
var debug = require('debug')('lc:server');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// configuration
mongoose.connect(config.get('database.url'));
var db = mongoose.connection;
db.on('open', function(){
    mongoose.connection.db.listCollections({name: 'contractors'})
    .next(function(err, collinfo) {
        debug("got collection list");
        if (!collinfo) {
            // The licensed contractor collection does not exist
            process.nextTick(require('./loadData'));
        }
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Set globals for Jade templates
app.locals.env = app.settings.env;

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', routes);
app.use('/users', users);

// load controllers
require('./boot')(app, {
});

// Disable caching
app.use(function(req, res, next){
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/**
 * Are we using https?
 */
var secure = config.get('server.secure');

/*
 * get the server port
 */
var http = app.get('transport');
var port = normalizePort(config.get('server.port') || process.env.PORT || '9110');
app.set('port', port);

/**
 * Create transports
 */
var http = require(secure ? 'https' : 'http');
app.set('transport', http);

/**
 * Disable caching
 */
app.disable('etag');

/**
 * Create the HTTP server
 */
if(secure === true) {
    var privateKey  = fs.readFileSync(config.get('server.certificateFile'), 'utf8');
    var certificate = fs.readFileSync(config.get('server.privateKeyFile'), 'utf8');
    var credentials = { key: privateKey, cert: certificate };
    var httpServer = http.createServer(credentials, app);
} else {
    var httpServer = http.createServer(app);
}

var io = require('./io');
io.createServer(httpServer);
app.set('server', httpServer);

debug('Express started HTTP on port ' + port);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}


module.exports = app;
