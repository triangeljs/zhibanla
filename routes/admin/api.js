var express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID;

router.get('/', function (req, res, next) {
    if (!req.session.isLogin) {
        res.json({ 'code': 401, 'message': '请求要求身份验证' });
        res.end();
    }

    //获取值班表
    if (req.query.action == 'get' && req.query.type == 'zhibanla') {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_users').find().toArray(function (err, results_users) {
                db.collection('ciic_rota').find({ 'year': req.query.year }).toArray(function (err, results) {
                    db.close(true);
                    res.json({ 'code': 200, 'message': '成功', 'list': results[0].list, 'users': results_users });
                    res.end();
                });
            });
        });
    }

    //添加节假日和特殊值班人员
    if (req.query.action == 'edit' && req.query.type == 'holiday') {
        MongoClient.connect(config.database.address, function (err, db) {
            var sid = new ObjectID(req.query.id);
            db.collection('ciic_holiday').find({ '_id': sid }).toArray(function (err, results_holiday) {
                var userArr = results_holiday[0].holidayUsers;
                userArr.push(req.query.holidayUsers);
                db.collection('ciic_holiday').update({ "_id": sid }, { $set: { "holidayUsers": userArr } }, function (err, result) {
                    db.close(true);
                    res.json({ 'code': 200, 'message': '成功' });
                    res.end();
                });
            });
        });
    }

    //删除节假日和特殊值班人员
    if (req.query.action == 'del_user' && req.query.type == 'holiday') {
        MongoClient.connect(config.database.address, function (err, db) {
            var sid = new ObjectID(req.query.id);
            db.collection('ciic_holiday').find({ '_id': sid }).toArray(function (err, results_holiday) {
                var len = results_holiday[0].holidayUsers.length;
                var newArr = [];
                for (var i = 0; i < len; i++) {
                    if (results_holiday[0].holidayUsers[i] != req.query.user) {
                        newArr.push(results_holiday[0].holidayUsers[i]);
                    }
                }
                db.collection('ciic_holiday').update({ "_id": sid }, { $set: { "holidayUsers": newArr } }, function (err, result) {
                    db.close(true);
                    res.json({ 'code': 200, 'message': '成功' });
                    res.end();
                });
            });
        });
    }

    //修改节假日和特殊值班 自动排班
    if (req.query.action == 'auto' && req.query.type == 'holiday') {
        MongoClient.connect(config.database.address, function (err, db) {
            var sid = new ObjectID(req.query.id);
            db.collection('ciic_holiday').update({ "_id": sid }, { $set: { "auto": req.query.auto } }, function (err, result) {
                db.close(true);
                res.json({ 'code': 200, 'message': '成功' });
                res.end();
            });
        });
    }

    //删除节假日和特殊值班
    if (req.query.action == 'del' && req.query.type == 'holiday') {
        MongoClient.connect(config.database.address, function (err, db) {
            var sid = new ObjectID(req.query.id);
            db.collection('ciic_holiday').remove({ '_id': sid }, function () {
                db.close(true);
                res.json({ 'code': 200, 'message': '成功' });
                res.end();
            });
        });
    }

    //删除值班调换单条信息
    if (req.query.action == 'del' && req.query.type == 'just') {
        MongoClient.connect(config.database.address, function (err, db) {
            var sid = new ObjectID(req.query.id);
            db.collection('ciic_note').remove({ '_id': sid }, function () {
                db.close(true);
                res.json({ 'code': 200, 'message': '成功' });
                res.end();
            });
        });
    }

    //修改值班人员信息
    if (req.query.action == 'edit' && req.query.type == 'users') {
        MongoClient.connect(config.database.address, function (err, db) {
            var sid = new ObjectID(req.query.id);
            var userName = req.query.userName;
            var startTime = req.query.startTime;
            var endTime = req.query.endTime;
            var jobs = req.query.jobs;
            db.collection('ciic_users').update({ "_id": sid }, { $set: { "userName": req.query.userName, "startTime": req.query.startTime, "endTime": req.query.endTime, "jobs": req.query.jobs } }, function (err, result) {
                db.close(true);
                res.json({ 'code': 200, 'message': '成功' });
                res.end();
            });
        });
    };

    //删除值班人员信息
    if (req.query.action == 'del' && req.query.type == 'users') {
        MongoClient.connect(config.database.address, function (err, db) {
            var sid = new ObjectID(req.query.id);
            db.collection('ciic_users').remove({ '_id': sid }, function () {
                db.close(true);
                res.json({ 'code': 200, 'message': '成功' });
                res.end();
            });
        });
    }

});

module.exports = router;