const express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	MongoDBStore = require('connect-mongodb-session')(session),
	config = require('./config'),
	fs = require('fs'),
	rfs = require('rotating-file-stream');

let store = new MongoDBStore({
	uri: config.database.address,
	collection: 'ciic_sessions'
});

let logDirectory = path.join(__dirname, 'logs');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
var accessLogStream = rfs('zhibanla.log', {
  interval: '1d',
  path: logDirectory
})

let index = require('./routes/index'),
	admin = require('./routes/admin'),
	admin_login = require('./routes/admin/login'),
	admin_index = require('./routes/admin/index'),
	admin_users = require('./routes/admin/users'),
	admin_holiday = require('./routes/admin/holiday'),
	admin_special = require('./routes/admin/special'),
	admin_replace = require('./routes/admin/replace'),
	admin_paiban = require('./routes/admin/paiban'),
	admin_logout = require('./routes/admin/logout'),
	paiban = require('./routes/paiban');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('combined', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({
	secret: 'zhibanla',
	cookie: { maxAge: 1000 * 60 * 60 },
	store: store,
	resave: true,
	saveUninitialized: true
}));

app.use('/', index);
app.use('/admin', admin);
app.use('/admin/login/', admin_login);
app.use('/admin/index/', admin_index);
app.use('/admin/users/', admin_users);
app.use('/admin/holiday/', admin_holiday);
app.use('/admin/special/', admin_special)
app.use('/admin/replace/', admin_replace);
app.use('/admin/paiban/', admin_paiban);
app.use('/admin/logout/', admin_logout);
app.use('/paiban', paiban);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
