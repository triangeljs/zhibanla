var express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    auth = require('../../server/auth.service'),
    MongoClient = require('mongodb').MongoClient;

router.get('/', auth.isLogin, function (req, res, next) {
    var loginStr = '<span class="loginUser">' + req.session.appuser.realname + '<a href="../../admin/logout/">退出</a></span>';
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_users').find().toArray(function (err, results) {
            db.close(true);
            res.render('admin/users', { 'targetTitle': '值班人员管理', 'userData': results, 'login': loginStr });
        });
    });
});

router.post('/', auth.isLogin, function (req, res, next) {
    var loginStr = '<span class="loginUser">' + req.session.appuser.realname + '<a href="../../admin/logout/">退出</a></span>';
    var userName = req.body.userName,
        jobs = req.body.jobs,
        startTime = req.body.startTime,
        endTime = req.body.endTime;
    if(userName == '' || startTime == '' || endTime == '') {
        res.redirect('../../admin/users/');
        return false;
    }
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_users').save({ 'userName': req.body.userName, 'jobs': req.body.jobs, 'startTime': startTime, 'endTime': endTime }, function (err, result) {
            db.collection('ciic_users').find().toArray(function (err, results) {
                db.close(true);
                res.render('admin/users', { 'targetTitle': '值班人员管理', 'userData': results, 'login': loginStr });
            });
        });
    });
});

module.exports = router;