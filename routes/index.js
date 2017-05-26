var express = require('express'),
	router = express.Router(),
	config = require('../config'),
	MongoClient = require('mongodb').MongoClient;

/* GET home page. */
router.get('/', function (req, res, next) {
	var year = req.query.year;
	var loginStr = '<span class="loginBtn"><a href="admin/login/" target="_blank">登录</a></span>';
	if (req.session.isLogin) {
		loginStr = '<span class="loginUser">' + req.session.appuser.realname + '<a href="admin/index/" target="_blank">进入管理后台</a></span>';
	}

	if (year) {
		MongoClient.connect(config.database.address, function (err, db) {
			db.collection('ciic_rota').find({ 'year': year }).toArray(function (err, results_rota) {
				db.collection('ciic_note').find().sort({ "startTime": 1 }).toArray(function (err, results_note) {
					db.close(true);
					res.json({ 'code': 200, 'message': '成功', 'list': results_rota[0].list, 'note': results_note });
					res.end();
				});
			});
		});
	} else {
		MongoClient.connect(config.database.address, function (err, db) {
			db.collection('ciic_users').find().toArray(function (err, results_users) {
				db.close(true);
				res.render('index', { 'users': results_users, 'login': loginStr });
				res.end();
			});
		});
	}
});

module.exports = router;