var express = require('express'),
    router = express.Router();

router.get('/', function (req, res, next) {
    req.session.isLogin = false;
    res.redirect('../login/');
});

module.exports = router;