class resHandlers {
    static resMessageRedirect (res, req, type, message, path) {
        req.flash(type, message);
        return res.redirect(path);
    };
};

module.exports = resHandlers;