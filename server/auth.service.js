var isLogin = function (req, res, next) {
    if (!req.session.isLogin) {
        res.redirect('../../admin/login/');
    } else {
        next();
    }
}

exports.isLogin = isLogin; 