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

    static checkRequest () {
        try {
          //  const {result, resbody} = await tripList(token);
        } catch (err) {
            if (err) console.error('The error from the check request is', err)
        }
    };

    static multipleRequestPosition (req, res, trip) {
        var stage_one, stage_two, stage_three ;
        var info = trip.trip_info;
        //this section will determine if the thing is about to end

        stage_one = info.filter(function (item) {
            return item.driver_status == "COMPLETED"
        });

        stage_two =info.filter(function (item) {
            return item.driver_status == "STARTED"
        });

        stage_three = info.filter(function (item) {
            return item.order == "1"
        });

        console.log('Window location href', req.originalUrl)
        if (trip.trip_type != 'multiple'){
            req.flash('error_msg', 'This trip has been completed')
            return res.redirect('/logistics/start_trip') // this may trip the system
        } else if (trip.requester_status == 'BACK_TO_OFFICE') {
            return res.redirect('/logistics/multiple_return')
        } else if (stage_one[0] == undefined && stage_three[0].driver_status != 'REQUESTED') {
            return res.redirect('/logistics/multiple_return')
        } else if (stage_two[0]) {
            return res.redirect('/logistics/multiple_dropoff')
        } else if (stage_two[0] == undefined && stage_three[0].driver_status != 'REQUESTED') {
            return res.redirect('/logistics/multiple_startTrip')
        }

    };

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