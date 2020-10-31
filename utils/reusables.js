// require the get timer function here
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

    // static checktime(trips) {
    //     var mess 
    //     const {result, resbody} = await getTime(token);
    //     if (result.statusCode == '200') {
    //         if (resbody.time_left < '0:10:00.128942' && resbody.time_left > '0:00:00.128942') {
    //             mess = 'Your time has almost elapsed, request for more time'
    //             mess = {mess}
    //         } else if (resbody.time_left < '0:00:00.000000' ) {
    //             mess = 'Your trip has ended'
    //             mess = {mess}
    //         }
    //     }
 
    // }
};

module.exports = resHandlers;