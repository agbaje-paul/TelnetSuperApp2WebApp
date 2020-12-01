const  {request_queries} = require('../queries/index');
const {} = require('../utils/query_util');

//store the list of the queries
const {
    sendRequest,
    carRequests,
    indRequests,
    getMyRequest,
    uplinequery,
    vehicleAssign,
    listVehicle
} = request_queries;

class Requests {

    // this controller allows staff to make request.
    static async createRequest (req, res) {
        const userDetails = req.session.userDetails
        res.render('create_request', {userDetails})
    };

    // this is the controller that handles the post request to the create request route
    static async handleRequest (req, res) {

        //you may need to add validation logic to this
        const userDetails = req.session.userDetails
        const token = userDetails.token
        var query
        if (req.body.trip_type == 'single') {
            query = {
                requester: userDetails.id,
                trip_type: 'single',
                request_type: req.body.request_type,
                destination: req.body.destination,
                purpose: req.body.purpose,
                upline: userDetails.upline_id,
                trip_duration: req.body.duration
            }

        } else{
            query = {
                requester: userDetails.id,
                trip_type: req.body.trip_type,
                request_type: req.body.request_type,
                upline: userDetails.upline_id,
                place_set: JSON.parse(req.body.random),
                trip_duration: req.body.duration
            }     
        }
        console.log('the query for the car request is:',query)
        try {
        
            const {result, resbody} = await sendRequest(query, token);
            console.log('the result body of the request to create event', resbody)
            if (result.statusCode == 201) {
                req.flash('success_msg', 'You have succesfully created a new vehicle request');
                return res.redirect('/requests/create_request');
            } else {
                req.flash('error_msg', 'Your request has not been succesfully made');
                return res.redirect('/requests/create_request');
            }
        } catch(err) {
            if (err) return console.error('Error', error);
        }

    }

    static async viewRequest (req, res) {
        const userDetails = req.session.userDetails;
        const token = userDetails.token;

        try{
            const {result, resbody} = await carRequests(token);
            const data_request = resbody;
            console.log('vehicle request', resbody)

            var data = data_request.filter(function (data) {
                return data.upline_approval == 'PENDING' // need to come back to this to populate the feilds with the data about the users
            });

            var driver = data_request.filter(function (data) {
                return data.driver_admin_approval == 'DENIED' // need to come back to this to populate the feilds with the data about the users
            });

            driver = driver[0];
            if (!driver) {
                data = data
            } else {
                data.push(driver)
            }
            
            console.log(driver)
            console.log('the data complete', data)
            req.session.carRequests = resbody
            if (result.statusCode == 200) {
                res.render('request_list',{userDetails, data})
            } else {
                req.flash('error_msg', 'The request could not be made');
                res.redirect('/requests/create_request')
            }
        }catch(err){
            if (err) return console.error('Error', error)
        }
    };

    static async memberRequest (req, res) {
        const userDetails = req.session.userDetails;
        const token = userDetails.token;
        const id = req.query.id;

        try{
            // you will need to come back to this logic
            // const {result, resbody} = await indRequests(token, id);
            // console.log('result', result.statusCode);
            // console.log('resbody', resbody)

            const car_requests = req.session.carRequests;
            

            var car_request =  car_requests.filter(function(car_request) {
                return car_request.id == req.query.id;
                
              });
              car_request = car_request[0];
              req.session.car_request = car_request;
              res.render('indCarRequest', {data:car_request, userDetails});
        }catch(err){
            if (err) return console.error('Error', error)
        }
    };

    static async myRequest (req, res) {
        const userDetails = req.session.userDetails;
        const token = userDetails.token;
        
        try{

            const {result, resbody} = await getMyRequest(token);
            const data = resbody;

            if (result.statusCode == 200) {
                res.render('myRequests', {data, userDetails});
            } else {
                req.flash('error_msg', 'The request could not be made');
                res.redirect('/requests/create_request')
            }
            
        }catch(err){
            if (err) return console.error('Error', error);
        }
    }

    static async uplineApprove (req, res) {
        const userDetails = req.session.userDetails;
        const token = userDetails.token;
        const car_request = req.session.car_request;
        const id = car_request.id; // you need to come back to all of this.

        var stringValue = req.body.button;
        var boolValue = stringValue.toLowerCase() == 'true' ? 'APPROVED' : 'DENIED';   //returns true

        const query = {
            requester: car_request.requester,
            trip_type:  car_request.trip_type,
            request_type: car_request.request_type,
            priority: parseInt(req.body.priority),
            destination: car_request.destination,
            purpose: car_request.purpose,
            upline: userDetails.id,
            upline_approval: boolValue,
            upline_reason: req.body.upline_reason,
            trip_duration:  car_request.trip_duration
        };
        console.log('the query is ', query)
        
        try{

            const {result, resbody} = await uplinequery(query, token, id);
            const data = resbody;
            console.log(result.statusCode)
            console.log(data)
            if (result.statusCode == 200) {
                if(data.upline_approval_status == 'APPROVED') {
                    req.flash('success_msg', 'You have successfully accepted a request')
                    res.redirect('/requests/view_request');
                } else {
                    req.flash('success_msg', 'You have successfully rejected a request')
                    res.redirect('/requests/view_request');
                }

            } else {
                req.flash('error_msg', 'The request could not be approved');
                res.redirect('/requests/view_request');
            }
            
        }catch(err){
            if (err) return console.error('Error', err);
        }
    }



    static async viewmanageRequest (req, res) {
        const userDetails = req.session.userDetails;
        const token = userDetails.token;

        try{
            const {result, resbody} = await carRequests(token);
            const data_request = resbody;

            var dataApproved = data_request.filter(function (dataApproved){
                return dataApproved.upline_approval == 'APPROVED'
            });
            var data = dataApproved.filter (function (data) {
                return data.driver_admin_approval == 'PENDING'
            });
            req.session.managecarRequests = resbody
            if (result.statusCode == 200) {
                res.render('manageRequest',{userDetails, data})
            } else {
                req.flash('error_msg', 'The request could not be made');
                res.redirect('/requests/manage_request')
            }
        }catch(err){
            if (err) return console.error('Error', err)
        }
    };

    static async manageMemberRequest (req, res) {
        const userDetails = req.session.userDetails;
        const token = userDetails.token;
        const id = req.query.id;

        try{

            const car_requests = req.session.managecarRequests;
            

            var car_request =  car_requests.filter(function(car_request) {
                return car_request.id == req.query.id;
                
              });
              car_request = car_request[0];
              req.session.managecar_request = car_request;;

              res.render('manageindCarRequest', {data:car_request, userDetails});
        }catch(err){
            if (err) return console.error('Error', error)
        }
    };

    static async manageUplineApprove (req, res) {
        const userDetails = req.session.userDetails;
        const token = userDetails.token;
        const car_request = req.session.managecar_request;
        const id = car_request.id; // you need to come back to all of this.

        var stringValue = req.body.button;
        var boolValue = stringValue.toLowerCase() == 'true' ? 'APPROVED' : 'DENIED'   //returns true

        const query = {
            requester: car_request.requester,
            trip_type:  car_request.trip_type,
            request_type: car_request.request_type,
            priority: car_request.priority,
            destination: car_request.destination,
            purpose: car_request.purpose,
            upline: 29,//car_request.upline, // this was taking out to see 
            driver_admin_approval: boolValue,
            driver_admin_reason: req.body.driver_admin_reason,
            trip_duration:  car_request.trip_duration 
        };

        console.log("query", query)

        
        try{

            const {result, resbody} = await uplinequery(query, token, id);
            const data = resbody;

            if (result.statusCode == 200) {
                if (resbody.driver_admin_status == 'APPROVED'){
                    req.session.approved = resbody

                    res.redirect('/requests/assign_vehicle')
                    // here it will not route back because the driver admin approval value is not here.
                } else {
                    req.flash('success_msg', 'You have succesfully rejected  a request')
                    res.redirect('/requests/viewmanage_request');
                    return
                }

            } else {
                req.flash('error_msg', 'The request could not be approved');
                res.redirect('/requests/viewmanage_request');
            }
            
        }catch(err){
            if (err) return console.error('Error', err);
        }
    }

    static async assignVehicle (req, res) {
        const userDetails = req.session.userDetails;
        const request = req.session.approved;
        const token = userDetails.token;
        const car_request = req.session.managecar_request
        
        try {
            const {result, resbody} = await listVehicle(token);
            const vehicles = resbody
            if (result.statusCode == 200) {
                if (typeof(vehicles[0])=='undefined' ) { // this should include the prioriity as well  &&
                    return res.redirect('/requests/reassign')
                } 
                res.render('assignVehicle', {userDetails, request, vehicles});
            } else if (result.statusCode == 401){
                req.flash('error_msg', resbody.detail);
                res.redirect('/requests/viewmanage_request')
            }
        }catch(err) {
            if (err) return console.error('Error', err);
        }

    }; 

    static async renderReassign (req, res) {
        const userDetails = req.session.userDetails;
        const request = req.session.approved;
        const token = userDetails.token;
        
        try {
            res.render('reassignPriority', {userDetails})
        }catch(err) {
            if (err) return console.error('Error', err);
        }

    }; 

    static async handleAssignVehicle (req, res) {
        const userDetails = req.session.userDetails;
        const approved = req.session.approved;
        const car_request = req.session.managecar_request;
        const token = userDetails.token;

        const query = {
            "vehicle_request": car_request.id,
            "vehicle": parseInt(req.query.id),
            "assigner": userDetails.id,
        };
        try {
            const {result, resbody} = await vehicleAssign(query, token)
            if (result.statusCode == 201) {
                req.flash('success_msg', 'A vehicle has been assigned')
                res.redirect('/requests/viewmanage_request')
            } else if (result.statusCode == 401){
                req.flash('error_msg', resbody.detail);
                res.redirect('/requests/viewmanage_request')
            } else {
                req.flash('error_msg', 'Something went wrong contact IT');
                res.redirect('/requests/viewmanage_request');      
            }
        } catch (err){
            if (err) return console.error('Error', err);
        }
    };
};

module.exports = Requests