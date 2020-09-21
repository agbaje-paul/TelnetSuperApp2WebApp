class Authorize {

    static driverAuthorize (req, res, next) {
        if (req.session.userDetails.role == 'Driver Admin') {
            return next()
        } else {
            return res.render('authorization')
        };

    };

    static supervisorAuthorize (req, res, next) {
        if (req.session.userDetails.role == 'Supervisor') {
            return next()
        } else {

            return res.redirect('/authorization')
        };

    };

};

module.exports = Authorize