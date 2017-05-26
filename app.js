var express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	MongoDBStore = require('connect-mongodb-session')(session);

var store = new MongoDBStore({
	uri: 'mongodb://localhost:27017/zhibanla',
	collection: 'ciic_sessions'
});

var index = require('./routes/index'),
	admin_index = require('./routes/admin/index'),
	admin_login = require('./routes/admin/login'),
	admin_logout = require('./routes/admin/logout'),
	admin_users = require('./routes/admin/users'),
	admin_addTime = require('./routes/admin/addTime'),
	admin_adjust = require('./routes/admin/adjust'),
	admin_api = require('./routes/admin/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({
	secret: 'rota',
	cookie: { maxAge: 1000 * 60 * 60 },
	store: store,
	resave: true,
	saveUninitialized: true
}));

app.use('/', index);
app.use('/admin/index', admin_index);
app.use('/admin/login', admin_login);
app.use('/admin/logout', admin_logout);
app.use('/admin/users', admin_users);
app.use('/admin/addTime', admin_addTime);
app.use('/admin/adjust', admin_adjust);
app.use('/admin/api', admin_api);

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
