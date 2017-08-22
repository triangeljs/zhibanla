const express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    auth = require('../../server/auth.service'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    moment = require('moment');

router.get('/', auth.isLogin, function (req, res, next) {
    const loginStr = req.session.appuser.realname + '<a href="../../admin/logout/" class="logoutBtn">退出</a></span>';
    let userData;
    getUsers().then(function (userList) {
        userData = userList;
        return getSpecial();
    }).then(function (specialData) {
        let filter_data = specialData.map(function (item) {
            let date = new Date(parseInt(item.specialTime)),
                y = date.getFullYear(),
                m = date.getMonth() + 1,
                d = date.getDate();
            item.specialTime_fmt = `${y}-${m}-${d}`;
            return item;
        });
        res.render('admin/special', { 'targetTitle': '特殊值班管理', 'sidebar': 'tszb', 'login': loginStr, 'userData': userData, 'specialData': filter_data });
    });
});

router.post('/', auth.isLogin, function (req, res, next) {
    const loginStr = req.session.appuser.realname + '<a href="../../admin/logout/" class="logoutBtn">退出</a></span>';
    let specialJosn = {
        "specialTime": new Date(req.body.specialDate).getTime(),
        "specialTitle": req.body.specialTitle,
        "specialUsers": []
    },
        userData;
    getUsers().then(function (userList) {
        userData = userList;
        return saveSpecial(specialJosn);
    }).then(function () {
        return getSpecial();
    }).then(function (specialData) {
        let filter_data = specialData.map(function (item) {
            let date = new Date(parseInt(item.specialTime)),
                y = date.getFullYear(),
                m = date.getMonth() + 1,
                d = date.getDate();
            item.specialTime_fmt = `${y}-${m}-${d}`;
            return item;
        });
        res.render('admin/special', { 'targetTitle': '特殊值班管理', 'sidebar': 'tszb', 'login': loginStr, 'userData': userData, 'specialData': filter_data });
    });
});

router.delete('/', auth.isLogin, function (req, res, next) {
    const specialID = new ObjectID(req.body.id);
    deleteSpecial(specialID).then(function (data) {
        res.json(data);
        res.end();
    });
});

router.put('/', auth.isLogin, function (req, res, next) {
    let specialID = new ObjectID(req.body.id),
        data = {
            "specialTime": parseInt(req.body.specialTime),
            "specialTitle": req.body.specialTitle,
            "specialUsers": req.body.specialUsers.split(',')
        };
    editSpecial(specialID, data).then(function (datas) {
        res.json(datas);
        res.end();
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

function getSpecial() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_special').find().sort({ "_id": -1 }).toArray(function (err, results) {
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

function saveSpecial(data) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_special').save({ 'specialTime': data.specialTime, 'specialTitle': data.specialTitle, 'specialUsers': data.specialUsers }, function (err, result) {
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

function editSpecial(id, data) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_special').update({ "_id": id }, { $set: data }, function (err, result) {
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

function deleteSpecial(id) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_special').remove({ '_id': id }, function (err, result) {
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

module.exports = router;