const express = require('express'),
    router = express.Router(),
    config = require('../config'),
    MongoClient = require('mongodb').MongoClient,
    moment = require('moment');

let json = {};

router.get('/', function (req, res, next) {
    getRota().then(function (data) {
        json["rota"] = data;
        return getSpecial();
    }).then(function (data) {
        json["special"] = data;
        return getNote();
    }).then(function (data) {
        json["note"] = data;
        res.json(json);
    });
});

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
                resolve(res);
            });
        });
    });
}

function getSpecial() {
    return new Promise(function (resolve, reject) {
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
                resolve(res);
            });
        });
    });
}

function getNote() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_note').find().toArray(function (err, res) {
                db.close(true);
                if (err) {
                    reject(err);
                    return false;
                }
                resolve(res);
            });
        });
    });
}

module.exports = router;