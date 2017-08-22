const express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    auth = require('../../server/auth.service'),
    MongoClient = require('mongodb').MongoClient;

let usersData = {};

router.get('/', auth.isLogin, function (req, res, next) {
    const loginStr = req.session.appuser.realname + '<a href="../../admin/logout/" class="logoutBtn">退出</a></span>';
    getUsers().then(function () {
        return getRota();
    }).then(function () {
        return getSpecial();
    }).then(function () {
        let usersArr = [], zhoumoArr = [], jieriArr = [], shijianArr = [];
        for (let name in usersData) {
            usersArr.push(name);
            zhoumoArr.push(usersData[name].zm);
            jieriArr.push(usersData[name].jr);
            shijianArr.push(usersData[name].sj);
        }
        res.render('admin/index', { 'targetTitle': '首页', 'sidebar': 'zbtj', 'login': loginStr, 'users': usersArr.join(','), 'zhoumo': zhoumoArr.join(','), 'jieri': jieriArr.join(','), 'shijian': shijianArr.join(',') });
    });
});

function getUsers() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_users').find().toArray(function (err, res) {
                db.close(true);
                if (err) {
                    reject(err);
                    return false;
                }
                let len = res.length, i, usersArr = [];
                for (i = 0; i < len; i++) {
                    usersData[res[i].userName] = {
                        "zm": 0,
                        "jr": 0,
                        "sj": 0
                    };
                    usersArr.push(res[i].userName);
                }
                resolve(usersArr.join(','));
            });
        });
    });
}

function getRota() {
    return new Promise(function (resolve, reject) {
        const targetTime = new Date(),
            startTime = new Date(targetTime.getFullYear() + '-01-01').getTime(),
            endTime = new Date(targetTime.getFullYear() + '-12-31').getTime();
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_rota').find({ "time": { '$gte': startTime, '$lte': endTime } }).toArray(function (err, res) {
                db.close(true);
                if (err) {
                    reject(err);
                    return false;
                }
                let len = res.length, i;
                for (i = 0; i < len; i++) {
                    if (res[i].attr == "周末值班") {
                        usersData[res[i].name].zm = usersData[res[i].name].zm + 1;
                    }
                    if (res[i].attr == "节日值班") {
                        usersData[res[i].name].jr = usersData[res[i].name].jr + 1;
                    }
                }
                resolve(res);
            })
        });
    });
}

function getSpecial() {
    return new Promise(function (reslove, reject) {
        const targetTime = new Date(),
            startTime = new Date(targetTime.getFullYear() + '-01-01').getTime(),
            endTime = new Date(targetTime.getFullYear() + '-12-31').getTime();
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_special').find({ "specialTime": { '$gte': startTime, '$lte': endTime } }).toArray(function (err, res) {
                db.close(true);
                if (err) {
                    reject(err);
                    return false;
                }
                let len = res.length, i;
                for (i = 0; i < len; i++) {
                    let subLen = res[i].specialUsers.length;
                    for (let j = 0; j < subLen; j++) {
                        let name = res[i].specialUsers[j];
                        usersData[name].sj = usersData[name].sj + 1;
                    }
                }
                reslove(res);
            });
        });
    });
}

module.exports = router;