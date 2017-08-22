const express = require('express'),
    router = express.Router(),
    auth = require('../server/auth.service');

router.get('/', function (req, res, next) {
    res.redirect('login/');
});

module.exports = router;