const consts        = require("./consts.json");

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var admins = require('./routes/admins');

// Таблицы
var area = require('./routes/tables/area');
var node = require('./routes/tables/node');
var node2Node = require('./routes/tables/node2node');
var person = require('./routes/tables/person');
var robot = require('./routes/tables/robot');
var room = require('./routes/tables/room');
var users = require('./routes/tables/users');
var admin = require('./routes/tables/admin');

var app = express();

var passport = require('passport');
var auth = require('./auth');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var socketFromDevice = require('./socketFromDevice');
//var socketServer = require('./socketServer');
var socketServer2 = require('./socketServer2');
//var routeBuilder = require('./routeBuilder');
var dataController = require('./dataController');

auth(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieSession({
    name: 'session',
    keys: [consts.session.key],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/admins', admins);


// Таблицы
app.use('/area', area);
app.use('/node', node);
app.use('/node2Node', node2Node);
app.use('/person', person);
app.use('/robot', robot);
app.use('/room', room);
app.use('/users', users);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
