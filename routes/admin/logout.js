var express = require('express'),
    router = express.Router();

router.get('/', function (req, res, next) {
    req.session.isLogin = false;
    res.redirect('../../');
});

module.exports = router;