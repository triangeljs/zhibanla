var express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    auth = require('../../server/auth.service'),
    MongoClient = require('mongodb').MongoClient;

router.get('/', auth.isLogin, function (req, res, next) {
    var loginStr = '<span class="loginUser">' + req.session.appuser.realname + '<a href="../../admin/logout/">退出</a></span>';
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_note').find().sort({"startTime":-1}).toArray(function (err, results_note) {
            db.collection('ciic_users').find().toArray(function (err, results_users) {
                db.close(true);
                res.render('admin/adjust', { 'targetTitle': '值班调换', 'noteData': results_note, 'usersData': results_users, 'login': loginStr });
            });
        });
    });
});

router.post('/', auth.isLogin, function (req, res, next) {
    var loginStr = '<span class="loginUser">' + req.session.appuser.realname + '<a href="../../admin/logout/">退出</a></span>';
     MongoClient.connect(config.database.address, function (err, db) {
         db.collection('ciic_note').save({ 'startTime': req.body.startTime, 'startName': req.body.startName, 'endName': req.body.endName }, function (err, result) {
            db.collection('ciic_note').find().sort({"startTime":-1}).toArray(function (err, results_note) {
                db.collection('ciic_users').find().toArray(function (err, results_users) {
                    db.close(true);
                    res.render('admin/adjust', { 'targetTitle': '值班调换', 'noteData': results_note, 'usersData': results_users, 'login': loginStr });
                });
            });
         });
     });
});

module.exports = router;