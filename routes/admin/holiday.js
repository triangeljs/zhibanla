const express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    auth = require('../../server/auth.service'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    moment = require('moment');

router.get('/', auth.isLogin, function (req, res, next) {
    const loginStr = req.session.appuser.realname + '<a href="../../admin/logout/" class="logoutBtn">退出</a></span>';
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_holiday').find().sort({"_id":-1}).toArray(function (err, results) {
            db.close(true);
            var data = results;
            var len = results.length;
            for (var i = 0; i < len; i++) {
                data[i].holidayDate = moment(data[i].holidayDate).format('YYYY-MM-DD');
            }
            res.render('admin/holiday', { 'targetTitle': '法定假日管理', 'sidebar': 'fdjr', 'login': loginStr, 'data': data });
        });
    });
});

router.post('/', auth.isLogin, function (req, res, next) {
    const loginStr = req.session.appuser.realname + '<a href="../../admin/logout/" class="logoutBtn">退出</a></span>',
        holidayDate = req.body.holidayDate,
        holidayName = req.body.holidayName,
        holidayTime = new Date(holidayDate).getTime();
    if (holidayDate == '' || holidayName == '') {
        res.redirect('../../admin/holiday/');
        return false;
    }
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_holiday').save({ 'holidayName': holidayName, 'holidayDate': holidayTime, 'lock': 'false' }, function (err, result) {
            db.collection('ciic_holiday').find().sort({"_id":-1}).toArray(function (err, results) {
                db.close(true);
                var data = results;
                var len = results.length;
                for (var i = 0; i < len; i++) {
                    data[i].holidayDate = moment(data[i].holidayDate).format('YYYY-MM-DD');
                }
                res.render('admin/holiday', { 'targetTitle': '法定假日管理', 'sidebar': 'fdjr', 'login': loginStr, 'data': data });
            });
        });
    });
});

router.put('/', auth.isLogin, function (req, res, next) {
    MongoClient.connect(config.database.address, function (err, db) {
        const holidayID = new ObjectID(req.body.id),
            holidayName = req.body.holidayName,
            lock = req.body.lock;
        db.collection('ciic_holiday').update({ "_id": holidayID }, { $set: { "holidayName": holidayName, "lock": lock } }, function (err, result) {
            db.close(true);
            res.json({ 'code': 200, 'message': '成功' });
            res.end();
        });
    });
});

router.delete('/', auth.isLogin, function (req, res, next) {
    const holidayID = new ObjectID(req.body.id);
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_holiday').remove({ '_id': holidayID }, function () {
            db.close(true);
            res.json({ 'code': 200, 'message': '成功' });
            res.end();
        });
    });
});

module.exports = router;