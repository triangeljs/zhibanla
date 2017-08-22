const express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    auth = require('../../server/auth.service'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    moment = require('moment');

router.get('/', auth.isLogin, function (req, res, next) {
    const loginStr = req.session.appuser.realname + '<a href="../../admin/logout/" class="logoutBtn">退出</a></span>';
    let usersData, rotaData;
    getUsers().then(function (data) {
        usersData = data;
        return getRota();
    }).then(function (data) {
        let filter_data = data.map(function (item) {
            let date = new Date(parseInt(item.time)),
                y = date.getFullYear(),
                m = date.getMonth() + 1,
                d = date.getDate();
            item.time_fmt = `${y}-${m}-${d}`;
            return item;
        });
        rotaData = filter_data;
        return getNote();
    }).then(function (data) {
        res.render('admin/replace', { 'targetTitle': '值班调换管理', 'sidebar': 'zbth', 'login': loginStr, 'usersData': usersData, 'noteData': data, 'rotaData': rotaData });
    });
});

router.post('/', auth.isLogin, function (req, res, next) {
    const loginStr = req.session.appuser.realname + '<a href="../../admin/logout/" class="logoutBtn">退出</a></span>';
    let data = {
        "startName": req.body.startName,
        "batch": req.body.replaceDate,
        "endName": req.body.endName
    };
    let usersData;
    saveNote(data).then(function () {
        return getUsers();
    }).then(function (data) {
        usersData = data;
        return getRota();
    }).then(function (data) {
        let filter_data = data.map(function (item) {
            let date = new Date(parseInt(item.time)),
                y = date.getFullYear(),
                m = date.getMonth() + 1,
                d = date.getDate();
            item.time_fmt = `${y}-${m}-${d}`;
            return item;
        });
        rotaData = filter_data;
        return getNote();
    }).then(function (data) {
        res.render('admin/replace', { 'targetTitle': '值班调换管理', 'sidebar': 'zbth', 'login': loginStr, 'usersData': usersData, 'noteData': data, 'rotaData': rotaData });
    })
});

router.put('/', auth.isLogin, function (req, res, next) {
    const targetTime = new Date(),
        startTime = new Date(targetTime.getFullYear() + '-01-01').getTime(),
        endTime = new Date(targetTime.getFullYear() + '-12-31').getTime();
    let name = req.body.startName;
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_rota').find({ "time": { '$gte': startTime, '$lte': endTime }, "name": name }).toArray(function (err, data) {
            db.close(true);
            if (err) {
                res.json(err);
            } else {
                let filter_data = data.map(function (item) {
                    let date = new Date(parseInt(item.time)),
                        y = date.getFullYear(),
                        m = date.getMonth() + 1,
                        d = date.getDate();
                    item.time_fmt = `${y}-${m}-${d}`;
                    return item;
                });
                res.json(filter_data);
            }
            res.end();
        });
    });
});

router.delete('/', auth.isLogin, function (req, res, next) {
    let id = new ObjectID(req.body.id);
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_note').remove({ '_id': id }, function (err, result) {
            db.close(true);
            if (err) {
                res.json(err);
            } else {
                res.json(result);
            }
            res.end();
        });
    });
});

function getUsers() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_users').find().toArray(function (err, results) {
                db.close(true);
                if (err) {
                    reject(err);
                    return false;
                }
                resolve(results);
            });
        });
    });
}

function saveNote(data) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_note').save({ 'startName': data.startName, 'endName': data.endName, 'batch': data.batch }, function (err, result) {
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

function getNote() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_note').find().toArray(function (err, results) {
                db.close(true);
                if (err) {
                    reject(err);
                    return false;
                }
                resolve(results);
            });
        });
    });
}

function getRota() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_rota').find().toArray(function (err, results) {
                db.close(true);
                if (err) {
                    reject(err);
                    return false;
                }
                resolve(results);
            });
        });
    });
}

module.exports = router;