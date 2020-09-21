const  {logistics_queries} = require('../queries/index');
const {} = require('../utils/query_util');
const {resMessageRedirect} = require('../utils/reusables')

//store the list of the queries
const {
    tripList,
    tripCreate,
    tripStart,
    updateDriverStatus
} = logistics_queries;

class Logistics {

    // this is used to get the list of the trips for a specific driver.
    static async getTrips (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        // come back to think about this cause there's no where else to redirect this thing to
        try{
            const {result, resbody} = await tripList(token);
            const trips = resbody
            // may need to come back here and include the validation logic to check the states of these things

            res.render('tripsList', {userDetails, trips});

        } catch(err){
            if (err) console.log('error', err)
        }
    };

    // this is used to start the trip
    static async createTrip (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token

        try{
            const vehicle_id = req.query.id;
            req.session.vehicle_id = vehicle_id;
            console.log('vehicle id',req.session.vehicle_id)
            res.render('createTrip', {userDetails});

        } catch(err){
            if (err) console.log('error', err)
        }
    };

    static async handlecreateTrip (req, res) {
        const userDetails = req.session.userDetails;
        const token = userDetails.token;
        const vehicle_id = req.session.vehicle_id;

        const query = {
            assigned_vehicle: vehicle_id,
            departure_meter_reading: req.body.departure_meter_reading,
            departure_fuel_reading: req.body.departure_fuel_reading,
            pickup_address: req.body.pickup_address,
            pickup_coordinate: req.body.pickup_coordinate
        };
        console.log('trip creation query is ', query)

        try{
            const {result, resbody} = await tripCreate(query, token)
            console.log(result.statusCode)
            console.log(resbody)
            if (result.statusCode == '201') {
                req.session.created_trip = resbody
                resMessageRedirect(res, req, 'success_msg', 'Your trip has registered','/logistics/getTrip')

            } else {
                // you have to come back to refactor
                resMessageRedirect(res, req, 'error_msg', 'Your trip could not be registered contact admin','/logistics/getTrip')
            };
        } catch(err){
            if (err) console.log('error', err)
        }
    };

    static async startTrip (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const created_trip = req.session.created_trip;
        try{
            const {result, resbody} = await tripStart(token);
            const trips = resbody
            // may need to come back here and include the validation logic to check the states of these things
            if (result.statusCode == '200') {
                var trip = trips.filter(function (trip) {
                    return trip.driver_id == userDetails.id
                });
                trip = trip.filter(function (trip) {
                    return trip.driver_arrived_destination == false
                });
                // console.log('filtered trips', trip)
                // if (typeof(trip[0]) != undefined) {
                //     trip = trip[0];
                // } else {
                //     trip = [];
                // }
                
                req.session.started_trip = trip[0];
                res.render('startTrip', {userDetails, trip});
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page','/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin','/logistics/getTrip')
            }
        } catch(err){
            if (err) console.log('error', err)
        }
    };

    static async handleStartTrip (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.started_trip
        const id = trip.id

        function getDate () {
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date+' '+time;

            return dateTime
        }
        const query = {
            assigned_vehicle: trip.assigned_vehicle,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            driver_status: 'ONGOING',
            departure_time: getDate()
        };

        console.log('The query to start drive is:', query)
        try{
            const {result, resbody} = await updateDriverStatus(query, token, id);
            const trips = resbody
            if (result.statusCode == '200') {
                res.render('tripStarted', {userDetails, trips});
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page','/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin','/logistics/getTrip')
            }

            // may need to come back here and include the validation logic to check the states of these things


        } catch(err){
            if (err) console.log('error', err)
        }
    };

        static async dropOff (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.started_trip
        const id = trip.id


        const query = {
            assigned_vehicle: trip.assigned_vehicle,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            driver_status: 'ONGOING',
            driver_return_journey:true,
            driver_arrived_destination: true

        };

        console.log('The query to start drive is:', query)
        try{
            const {result, resbody} = await updateDriverStatus(query, token, id);
            const trips = resbody
            if (result.statusCode == '200') {
                res.render('tripStarted2', {userDetails, trips});
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page','/logistics/startTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin','/logistics/startTrip')
            }

            // may need to come back here and include the validation logic to check the states of these things


        } catch(err){
            if (err) console.log('error', err)
        }
    };

    

    static async endTrip (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.started_trip
        const id = trip.id

        function getDate () {
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date+' '+time;

            return dateTime
        }
        const query = {
            assigned_vehicle: trip.assigned_vehicle,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            driver_status: 'COMPLETED',
            departure_time: getDate(),
            driver_arrived_office: true,
        };

        try{
            
                const {result, resbody} = await updateDriverStatus(query, token, id);
                const trips = resbody
                if (result.statusCode == '200') {
                    resMessageRedirect(res, req, 'success_msg', 'You have completed your trip','/logistics/startTrip');
                } else if (result.statusCode == '401') {
                    resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page','/logistics/startTrip')
                    // you may need to add a middleware to make sure only the right personal can see this.
                } else {
                    resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin','/logistics/startTrip')
                }
    
                // may need to come back here and include the validation logic to check the states of these things

        } catch(err){
            if (err) console.log('error', err)
        }
    };

    static async staffStartTrip (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const created_trip = req.session.created_trip;
        try{
            const {result, resbody} = await tripStart(token);
            const trips = resbody
            // may need to come back here and include the validation logic to check the states of these things
            if (result.statusCode == '200') {
                var trip = trips.filter(function (trip) {
                    return trip.driver_id == userDetails.id
                });
                trip = trip.filter(function (trip) {
                    return trip.driver_arrived_destination == false
                });
                // console.log('filtered trips', trip)
                // if (typeof(trip[0]) != undefined) {
                //     trip = trip[0];
                // } else {
                //     trip = [];
                // }
                
                req.session.started_trip = trip[0];
                res.render('staffStartTrip', {userDetails, trip});
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page','/logistics/dashboard')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin','/logistics/dashboard')
            }
        } catch(err){
            if (err) console.log('error', err)
        }
    };

    static async staffHandleStartTrip (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.started_trip
        const id = trip.id

        const query = {
            assigned_vehicle: trip.assigned_vehicle,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            requester_status: 'ONGOING',
        };

        console.log('The query to start drive is:', query)
        try{
            const {result, resbody} = await updateDriverStatus(query, token, id);
            const trips = resbody
            if (result.statusCode == '200') {
                res.render('staffTripStarted', {userDetails, trips});
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page','/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin','/logistics/staffStartTrip')
            }

            // may need to come back here and include the validation logic to check the states of these things


        } catch(err){
            if (err) console.log('error', err)
        }
    };

    static async staffEndTrip (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.started_trip
        const id = trip.id

        function getDate () {
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date+' '+time;

            return dateTime
        }
        const query = {
            assigned_vehicle: trip.assigned_vehicle,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            requester_status: 'COMPLETED',
            requester_arrival_time: getDate(),
            requester_dropped_off: true,
        };

        try{
            
                const {result, resbody} = await updateDriverStatus(query, token, id);
                const trips = resbody
                if (result.statusCode == '200') {
                    resMessageRedirect(res, req, 'success_msg', 'You have completed your trip','/logistics/staffStartTrip');
                } else if (result.statusCode == '401') {
                    resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page','/logistics/staffStartTrip')
                    // you may need to add a middleware to make sure only the right personal can see this.
                } else {
                    resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin','/logistics/staffStartTrip')
                }
    
                // may need to come back here and include the validation logic to check the states of these things

        } catch(err){
            if (err) console.log('error', err)
        }
    };

}

module.exports = Logistics