var express = require('express'),
    router = express.Router(),
    config = require('../../config'),
    MongoClient = require('mongodb').MongoClient;

router.get('/', function (req, res, next) {
    res.render('admin/login');
});

router.post('/', function (req, res, next) {
    if (req.session.logonCount >= 5) {
        res.redirect('../admin/login/');
    }
    MongoClient.connect(config.database.address, function (err, db) {
        db.collection('ciic_admin').find({ 'username': req.body.username }).toArray(function (err, docs) {
            db.close(true);
            if (docs.length != 0 && docs[0].username == req.body.username && docs[0].password == req.body.password) {
                req.session.logonCount = 0;
                req.session.appuser = {
                    realname: docs[0].realname
                };
                req.session.isLogin = true;
                res.redirect('../../admin/index/');
            } else {
                req.session.logonCount = req.session.logonCount ? req.session.logonCount + 1 : 1;
                res.redirect('../admin/login/');
            }
        });
    });
});

module.exports = router;