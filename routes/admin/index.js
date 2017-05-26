var express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    auth = require('../../server/auth.service'),
    MongoClient = require('mongodb').MongoClient;

var year = null,
    weekArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    userData = {
        'sheji': [],
        'zhizuo': [],
        'cursor': {
            'sheji': 0,
            'zhizuo': 0
        },
        'jobs': ''
    };
var holidayData = [];

router.get('/', auth.isLogin, function (req, res, next) {
    var loginStr = '<span class="loginUser">' + req.session.appuser.realname + '<a href="../../admin/logout/">退出</a></span>';
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_holiday').find().toArray(function (err, results) {
            db.close(true);
            holidayData = results;
            res.render('admin/index', { 'targetTitle': '首页', 'login': loginStr });
        });
    });
});

router.post('/', auth.isLogin, function (req, res, next) {
    year = req.body.year;

    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_users').find().toArray(function (err, results_users) {
            userData.sheji = [];
            userData.zhizuo = [];
            var len = results_users.length;
            for (var i = 0; i < len; i++) {
                var obj = {
                    'userName': results_users[i].userName,
                    'startTime': results_users[i].startTime,
                    'endTime': results_users[i].endTime
                }
                if (results_users[i].jobs == '设计') {
                    userData.sheji.push(results_users[i]);
                }
                if (results_users[i].jobs == '制作') {
                    userData.zhizuo.push(results_users[i]);
                }
            }

            var lastYear = Number(year) - 1 + '';
            db.collection('ciic_rota').find({ 'year': lastYear }).toArray(function (ree, results_rota) {
                if (results_rota.length > 0) {
                    userData.cursor = results_rota[0].cursor;
                    userData.jobs = results_rota[0].jobs;
                } else {
                    userData.cursor = {
                        'sheji': 0,
                        'zhizuo': 0
                    }
                    userData.jobs = 'sheji';
                }
                var rotas = scheduling(year);
                db.collection('ciic_rota').remove({ 'year': year }, function () {
                    db.collection('ciic_rota').save(rotas, function () {
                        db.close(true);
                        res.json({ 'code': 200, 'message': '成功', 'jsonData': rotas });
                        res.end();
                    });
                });
            });
        });
    });
});

function scheduling(year) {
    var next_year = parseInt(year) + 1,
        time_start = new Date(`${year}-01-01`),
        time_end = new Date(`${next_year}-01-01`),
        current_date = time_start;

    jsonData = {};
    jsonData.year = year;
    jsonData.list = [];

    while (current_date.getTime() < time_end.getTime()) {
        var obj = {};
        obj.startTime = `${current_date.getFullYear()}-${current_date.getMonth() + 1}-${current_date.getDate()}`;

        var isShow = isTime(current_date);
        if (isShow.isTime == '2') {
            obj.content = isShow.data.holidayName;
            obj.users = getUser('auto', current_date);
            jsonData.list.push(obj);
        }

        if (isShow.isTime == '3') {
            obj.content = isShow.data.holidayName;
            obj.users = isShow.data.holidayUsers;
            jsonData.list.push(obj);
        }

        if (current_date.getDay() == 0 && isShow.isTime == '1') {
            obj.content = '周日值班';
            obj.users = getUser('zhizuo', current_date);
            jsonData.list.push(obj);
        }
        if (current_date.getDay() == 6 && isShow.isTime == '1') {
            obj.content = '周六值班';
            obj.users = getUser('sheji', current_date);
            jsonData.list.push(obj);
        }

        current_date.setTime(current_date.getTime() + 86400000);
    }

    jsonData.cursor = userData.cursor;
    jsonData.jobs = userData.jobs;
    return jsonData;
}

function getUser(jobs, current_date) {
    var jsonUser = [];
    if (jobs == 'auto') {
        if (userData.jobs == 'sheji') {
            jobs = 'sheji';
        } else {
            jobs = 'zhizuo';
        }
    }
    if (jobs == 'sheji') {
        var len = userData.sheji.length;
        for (var i = 0; i < len; i++) {
            var userStartTime = new Date(userData.sheji[userData.cursor.sheji].startTime + ' 00:00:00.000Z');
            var userEndTime = new Date(userData.sheji[userData.cursor.sheji].endTime + ' 00:00:00.000Z');
            if (userStartTime.getTime() <= current_date.getTime() && userEndTime.getTime() >= current_date.getTime()) {
                jsonUser.push(userData.sheji[userData.cursor.sheji].userName);
                userData.cursor.sheji = (userData.cursor.sheji + 1) % len;
                userData.jobs = 'zhizuo';
                return jsonUser;
            }
            userData.cursor.sheji = (userData.cursor.sheji + 1) % len;
        }
    }
    if (jobs == 'zhizuo') {
        var len = userData.zhizuo.length;
        for (var i = 0; i < len; i++) {
            var userStartTime = new Date(userData.zhizuo[userData.cursor.zhizuo].startTime + ' 00:00:00.000Z');
            var userEndTime = new Date(userData.zhizuo[userData.cursor.zhizuo].endTime + ' 00:00:00.000Z');
            if (userStartTime.getTime() <= current_date.getTime() && userEndTime.getTime() >= current_date.getTime()) {
                jsonUser.push(userData.zhizuo[userData.cursor.zhizuo].userName);
                userData.cursor.zhizuo = (userData.cursor.zhizuo + 1) % len;
                userData.jobs = 'sheji';
                return jsonUser;
            }
            userData.cursor.zhizuo = (userData.cursor.zhizuo + 1) % len;
        }
    }
    return jsonUser;
}

function isTime(current_date) {
    var len = holidayData.length;
    for (var i = 0; i < len; i++) {
        var userDate = new Date(holidayData[i].holidayTime + ' 00:00:00.000Z');
        if (current_date.getTime() == userDate.getTime() && holidayData[i].auto == '是') {
            return { 'isTime': '2', 'data': holidayData[i] };
        }
        if (current_date.getTime() == userDate.getTime() && holidayData[i].auto == '否') {
            return { 'isTime': '3', 'data': holidayData[i] };
        }
    }
    return { 'isTime': '1' };
}

module.exports = router;