const express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    auth = require('../../server/auth.service'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID;

router.get('/', auth.isLogin, function (req, res, next) {
    const loginStr = req.session.appuser.realname + '<a href="../../admin/logout/" class="logoutBtn">退出</a></span>';
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_users').find().toArray(function (err, results) {
            db.close(true);
            res.render('admin/users', { 'targetTitle': '值班人员管理', 'sidebar': 'zbry', 'userData': results, 'login': loginStr });
        });
    });
});

router.post('/', auth.isLogin, function (req, res, next) {
    const loginStr = req.session.appuser.realname + '<a href="../../admin/logout/" class="logoutBtn">退出</a></span>',
        userName = req.body.userName,
        jobs = req.body.jobs;
    if (userName == '' || jobs == '0') {
        res.redirect('../../admin/users/');
        return false;
    }
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_users').save({ 'userName': req.body.userName, 'jobs': req.body.jobs, 'lock': 'false' }, function (err, result) {
            db.collection('ciic_users').find().toArray(function (err, results) {
                db.close(true);
                res.render('admin/users', { 'targetTitle': '值班人员管理', 'sidebar': 'zbry', 'userData': results, 'login': loginStr });
            });
        });
    });
});

router.put('/', auth.isLogin, function (req, res, next) {
    MongoClient.connect(config.database.address, function (err, db) {
        const userID = new ObjectID(req.body.id),
            userName = req.body.userName,
            jobs = req.body.jobs,
            lock = req.body.lock;
        db.collection('ciic_users').update({ "_id": userID }, { $set: { "userName": userName, "jobs": jobs, "lock": lock } }, function (err, result) {
            db.close(true);
            res.json({ 'code': 200, 'message': '成功' });
            res.end();
        });
    });
});

router.delete('/', auth.isLogin, function (req, res, next) {
    const userID = new ObjectID(req.body.id);
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_users').remove({ '_id': userID }, function () {
            db.close(true);
            res.json({ 'code': 200, 'message': '成功' });
            res.end();
        });
    });
});

module.exports = router;