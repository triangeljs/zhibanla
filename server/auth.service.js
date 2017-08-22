var isLogin = function (req, res, next) {
    if (!req.session.isLogin) {
        res.redirect('../login/');
    } else {
        next();
    }
}

exports.isLogin = isLogin;