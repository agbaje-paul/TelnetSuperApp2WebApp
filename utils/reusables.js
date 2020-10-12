class resHandlers {
    static resMessageRedirect (res, req, type, message, path) {
        req.flash(type, message);
        return res.redirect(path);
    };

    static getDate () {
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;

        return dateTime
    }
};

module.exports = resHandlers;