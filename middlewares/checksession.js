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
};

module.exports = Authenticate