const express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    auth = require('../../server/auth.service'),
    MongoClient = require('mongodb').MongoClient,
    moment = require('moment');

let users = {};

router.get('/', auth.isLogin, function (req, res, next) {
    const loginStr = req.session.appuser.realname + '<a href="../../admin/logout/" class="logoutBtn">退出</a></span>';
    searchCurrentRota()
        .then(function (obj) {
            filter_obj = obj.map(function (item) {
                var date = new Date(parseInt(item.time)),
                    y = date.getFullYear(),
                    m = date.getMonth() + 1,
                    d = date.getDate();
                item.time_fmt = `${y}-${m}-${d}`;
                return item;
            });
            res.render('admin/paiban', { 'targetTitle': '生成值班表管理', 'sidebar': '', 'login': loginStr, 'data': filter_obj });
        });
});

router.post('/', auth.isLogin, function (req, res, next) {
    const startTime = req.body.paibanDate,
        loginStr = req.session.appuser.realname + '<a href="../../admin/logout/" class="logoutBtn">退出</a></span>';
    getUsers()
        .then(function () {
            return deleteData(startTime);
        })
        .then(function () {
            return initData(startTime);
        })
        .then(function () {
            return getHoliday();
        })
        .then(function (data) {
            return paiban(startTime, data);
        })
        .then(function () {
            return searchCurrentRota();
        })
        .then(function (obj) {
            filter_obj = obj.map(function (item) {
                var date = new Date(parseInt(item.time)),
                    y = date.getFullYear(),
                    m = date.getMonth() + 1,
                    d = date.getDate();
                item.time_fmt = `${y}-${m}-${d}`;
                return item;
            });
            res.render('admin/paiban', { 'targetTitle': '生成值班表管理', 'sidebar': '', 'login': loginStr, 'data': filter_obj });
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
                db.close(true);
                if (err) {
                    reject(err);
                    return false;
                }
                resolve(result);
            });
        });
    });
}

function initData(time) {
    return new Promise(function (resolve, reject) {
        const targetTime = new Date(time),
            selfTime = new Date(targetTime.getFullYear() - 1 + '-01-01').getTime(),
            endTime = targetTime.getTime();
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_rota').find({ "time": { '$gte': selfTime, '$lte': endTime } }).toArray(function (err, result) {
                db.close(true);
                if (err) {
                    reject(err);
                    return false;
                }
                let len = result.length;
                for (let i = 0; i < len; i++) {
                    if(result[i].jobs == '') {
                        continue;
                    }
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

function getHoliday() {
    return new Promise(function (resolve, reject) {
        const targetTime = new Date(),
            startTime = new Date(targetTime.getFullYear() + '-01-01').getTime(),
            endTime = new Date(targetTime.getFullYear() + '-12-31').getTime();
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_holiday').find({ "holidayDate": { '$gte': startTime, '$lte': endTime } }).toArray(function (err, res) {
                db.close(true);
                if (err) {
                    reject(err);
                    return false;
                }
                resolve(res);
            })
        });
    });
}

function paiban(time, holidayData) {
    return new Promise(function (resolve, reject) {
        const timestamp = new Date(time),
            next_year = timestamp.getFullYear() + 1,
            time_start = new Date(`${time}`),
            time_end = new Date(`${next_year}-01-01`),
            current_date = time_start;
        let len = holidayData.length, i,
            arr = [],
            currentJobs = 'sheji';
        while (current_date.getTime() < time_end.getTime()) {
            let obj = {};
            //周六排班
            if (current_date.getDay() == 6 && isCurrent(current_date.getTime(), holidayData)) {
                let userInfo = searchUser("sheji");
                obj.title = "周六值班";
                obj.name = userInfo["name"];
                obj.jobs = 'sheji';
                obj.time = current_date.getTime();
                obj.batch = userInfo["batch"];
                obj.attr = "周末值班";
                currentJobs = 'zhizuo';
                arr.push(obj);
            }
            //周日排班
            if (current_date.getDay() == 0 && isCurrent(current_date.getTime(), holidayData)) {
                let userInfo = searchUser("zhizuo");
                obj.title = "周日值班";
                obj.name = userInfo["name"];
                obj.jobs = 'zhizuo';
                obj.time = current_date.getTime();
                obj.batch = userInfo["batch"];
                obj.attr = "周末值班";
                currentJobs = 'sheji';
                arr.push(obj);
            }
            //法定假日排班
            for (i = 0; i < len; i++) {
                if(current_date.getTime() == holidayData[i].holidayDate && holidayData[i].lock == 'false') {
                    let userInfo = searchUser(currentJobs);
                    obj.title = holidayData[i].holidayName;
                    obj.name = userInfo['name'];
                    obj.jobs = currentJobs;
                    obj.time = current_date.getTime();
                    obj.batch = userInfo['batch'];
                    obj.attr = "节日值班";
                    arr.push(obj);
                    if (currentJobs == 'sheji') {
                        currentJobs = 'zhizuo';
                    } else {
                        currentJobs = 'sheji';
                    }
                }
                if(current_date.getTime() == holidayData[i].holidayDate && holidayData[i].lock == 'true') {
                    obj.title = holidayData[i].holidayName;
                    obj.name = '';
                    obj.jobs = '';
                    obj.time = current_date.getTime();
                    obj.batch = 0;
                    obj.attr = "节日补班";
                    arr.push(obj);
                }
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

function isCurrent(time, data) {
    const len = data.length;
    let i;
    for (i = 0; i < len; i++) {
        if (data[i].holidayDate == time) {
            return false;
        }
    }
    return true;
}

function searchCurrentRota() {
    return new Promise(function (resolve, reject) {
        const targetTime = new Date(),
            startTime = new Date(targetTime.getFullYear() + '-01-01').getTime(),
            endTime = new Date(targetTime.getFullYear() + '-12-31').getTime();
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_rota').find({ "time": { '$gte': startTime, '$lte': endTime } }).sort({"_id":1}).toArray(function (err, res) {
                db.close(true);
                if (err) {
                    reject(err);
                    return false;
                }
                resolve(res);
            })
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
        users["pointer"][jobs] = pointer;
    }
}

module.exports = router;