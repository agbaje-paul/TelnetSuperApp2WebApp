class Authenticate {

    static forwardAuthenticate (req, res, next) {
        if (req.session.userDetails) {
            res.redirect('/dashboard');
            return
        }; 
        next ()
    };

    static checkSession (req, res, next) { //this may need to be edited cause it does not make that much sense atm.
        if (!req.session.userDetails) {
            req.flash('error', 'You are not logged in');
            res.redirect ('/login');        
        } else if (req.session.userDetails) {
            return next()
        }   
    }

    static adminForwardAuthenticate(req, res, next) {
        if (req.session.userDetails) { //|| req.session.userDetails.role == 'Super Admin' // find a workaround for this
            if (req.session.userDetails.role == 'Super Admin'){
                res.redirect('/admin/dashboard');
            } else {
                req.flash('error_msg', 'You are not authorized to login as an admin');
                res.redirect('/dashboard')
            }
        };
        next()
    };

    static adminCheckSession(req, res, next) {
        if (!req.session.userDetails) { // || req.session.userDetails.role != 'Super Admin' // find a work around for this
            req.flash('error', 'You are not logged in');
            res.redirect('/admin/login');
        } else if (req.session.userDetails) {
            if(req.session.userDetails.role == 'Super Admin') {
                return next()
            } else {
                req.flash('error_msg', 'You are not authorized to login as an admin');
                res.redirect('/dashboard')     
            }

        }
    }
};

module.exports = Authenticate