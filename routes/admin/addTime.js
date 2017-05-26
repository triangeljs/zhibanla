var express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    auth = require('../../server/auth.service'),
    MongoClient = require('mongodb').MongoClient;

router.get('/', auth.isLogin, function (req, res, next) {
    var loginStr = '<span class="loginUser">' + req.session.appuser.realname + '<a href="../../admin/logout/">退出</a></span>';
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_holiday').find().sort({"_id":-1}).toArray(function (err, results_holiday) {
            db.collection('ciic_users').find().toArray(function (err, results_users) {
                db.close(true);
                res.render('admin/addTime', { 'targetTitle': '添加节假日和特殊值班', 'holidayData': results_holiday, 'usersData': results_users, 'login': loginStr });
            });
        });
    });
});

router.post('/', auth.isLogin, function (req, res, next) {
    var loginStr = '<span class="loginUser">' + req.session.appuser.realname + '<a href="../../admin/logout/">退出</a></span>';
    MongoClient.connect(config.database.address, function (err, db) {
        var users = [];
        db.collection('ciic_holiday').save({ 'holidayTime': req.body.holidayTime, 'holidayName': req.body.holidayName, 'auto': '是', 'holidayUsers': users }, function (err, result) {
            db.collection('ciic_holiday').find().sort({"_id":-1}).toArray(function (err, results_holiday) {
                db.collection('ciic_users').find().toArray(function (err, results_users) {
                    db.close(true);
                    res.render('admin/addTime', { 'targetTitle': '添加节假日和特殊值班', 'holidayData': results_holiday, 'usersData': results_users, 'login': loginStr });
                });
            });
        });
    });
});

module.exports = router;