const express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    auth = require('../../server/auth.service'),
    MongoClient = require('mongodb').MongoClient,
    moment = require('moment');

let users = {};

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
    const startTime = req.body.time;
    getUsers()
        .then(function () {
            return deleteData(startTime);
        })
        .then(function () {
            return initData(startTime);
        })
        .then(function () {
            return paiban(startTime);
        })
        .then(function () {
            return getOnDuty(startTime);
        })
        .then(function (obj) {
            res.json(obj);
        });
});

function getUsers() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_users').find().toArray(function (err, res) {
                if (err) {
                    reject(err);
                    return false;
                }
                let len = res.length,
                    shejiArr = [],
                    zhizuoArr = [];
                for (let i = 0; i < len; i++) {
                    let obj = {};
                    obj["name"] = res[i].userName;
                    obj["lock"] = res[i].lock;
                    obj["batch"] = 0;
                    if (res[i].jobs == "设计") {
                        shejiArr.push(obj);
                    }
                    if (res[i].jobs == "制作") {
                        zhizuoArr.push(obj);
                    }
                }
                users['sheji'] = shejiArr;
                users['zhizuo'] = zhizuoArr;
                users['pointer'] = {
                    "sheji": 0,
                    "zhizuo": 0
                }
                resolve(res);
            });
        });
    });
}

function deleteData(time) {
    return new Promise(function (resolve, reject) {
        const timestamp = new Date(time).getTime();
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_rota').deleteMany({ "time": { $gte: timestamp } }, function (err, result) {
                if (err) {
                    reject(err);
                    return false;
                }
                db.close(true);
                resolve(result);
            });
        });
    });
}

function initData(time) {
    return new Promise(function (resolve, reject) {
        const targetTime = new Date(time),
            selfTime = new Date(targetTime.getFullYear() - 1 + '-01-01').getTime(),
            startTime = new Date(targetTime.getFullYear() + '-01-01').getTime(),
            endTime = targetTime.getTime();
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_rota').find({ "time": { '$gte': selfTime, '$lt': endTime } }).toArray(function (err, result) {
                if (err) {
                    reject(err);
                    return false;
                }
                db.close(true);
                let len = result.length;
                for (let i = 0; i < len; i++) {
                    let buffer = users[result[i].jobs],
                        buffer_len = buffer.length;
                    for (let j = 0; j < buffer_len; j++) {
                        if (buffer[j].name == result[i].name) {
                            buffer[j].batch = result[i].batch;
                            users["pointer"][result[i].jobs] = (j + 1) % buffer_len;
                        }
                    }
                }
                resolve(result);
            });
        });
    });
}

function paiban(time) {
    return new Promise(function (resolve, reject) {
        const timestamp = new Date(time);
        let next_year = timestamp.getFullYear() + 1,
            time_start = new Date(`${time}`),
            time_end = new Date(`${next_year}-01-01`),
            current_date = time_start;
        let arr = [];
        while (current_date.getTime() < time_end.getTime()) {
            let obj = {};
            //周六值班
            if (current_date.getDay() == 6) {
                let userInfo = searchUser("sheji");
                obj.title = "周六值班";
                obj.name = userInfo["name"];
                obj.jobs = 'sheji',
                    //obj.time = moment(current_date.getTime()).format('YYYY-MM-DD');
                    obj.time = current_date.getTime();
                obj.batch = userInfo["batch"];
                arr.push(obj);
            }
            //周日值班
            if (current_date.getDay() == 0) {
                let userInfo = searchUser("zhizuo");
                obj.title = "周日值班";
                obj.name = userInfo["name"];
                obj.jobs = 'zhizuo',
                    //obj.time = moment(current_date.getTime()).format('YYYY-MM-DD');
                    obj.time = current_date.getTime();
                obj.batch = userInfo["batch"];
                arr.push(obj);
            }
            current_date.setTime(current_date.getTime() + 86400000);
        }
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_rota').insertMany(arr, function (err, result) {
                if (err) {
                    reject(err);
                    return false;
                }
                db.close(true);
                resolve(result);
            });
        });
    });
}

function getOnDuty(time) {
    return new Promise(function (resolve, reject) {
        const timestamp = new Date(time),
            startTime = new Date(timestamp.getFullYear() + '-01-01').getTime(),
            endTime = new Date(timestamp.getFullYear() + 1 + '-01-01').getTime();
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_rota').find({ "time": { '$gte': startTime, '$lt': endTime } }).toArray(function (err, result) {
                if (err) {
                    reject(err);
                    return false;
                }
                resolve(result);
            });
        });
    });
}

function searchUser(jobs) {
    let data = {},
        pointer = users["pointer"][jobs],
        len = users[jobs].length,
        lock = true;
    while (lock) {
        if (users[jobs][pointer].lock == "false") {
            data.name = users[jobs][pointer].name;
            data.batch = users[jobs][pointer].batch + 1;
            users[jobs][pointer].batch = data.batch;
            pointer = (users["pointer"][jobs] + 1) % len;
            users["pointer"][jobs] = pointer;
            lock = false;
            return data;
        }
        pointer = (users["pointer"][jobs] + 1) % len;
    }
}

module.exports = router;