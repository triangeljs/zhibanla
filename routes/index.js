const express = require('express'),
	router = express.Router(),
	config = require('../config'),
    MongoClient = require('mongodb').MongoClient;

/* GET home page. */
router.get('/', function (req, res, next) {
	getUsers().then(function (data) {
		res.render('content/index', { 'title': '值班啦', 'data': data });
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
				resolve(res);
			});
		});
	});
}

function getRota() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_rota').find().toArray(function (err, res) {
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
        MongoClient.connect(config.database.address, function (err, db) {
            db.collection('ciic_special').find().toArray(function (err, res) {
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