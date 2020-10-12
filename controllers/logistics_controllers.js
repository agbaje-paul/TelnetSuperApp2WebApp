const  {logistics_queries} = require('../queries/index');
const {} = require('../utils/query_util');
const {resMessageRedirect, getDate} = require('../utils/reusables');

//store the list of the queries
const {
    tripList,
    tripCreate,
    tripStart,
    updateDriverStatus,
    stafftripStart
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
                // this part will need to be replaced with enpoint to get the trips
                
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

        const query = {
            assigned_vehicle: trip.assigned_vehicle,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            driver_status: 'ONGOING',
            departure_time: getDate()
        };

        console.log('The query to start drive is for driver:', query)
        try{
            const {result, resbody} = await updateDriverStatus(query, token, id);
            const trips = resbody
            req.session.trips_dropoff = trips
            if (result.statusCode == '200') {
                res.redirect('/logistics/dropoff')
                //res.render('tripStarted', {userDetails, trips});
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
        const trips = req.session.trips_dropoff
        // come back to think about this cause there's no where else to redirect this thing to
        try{
            res.render('tripStarted', {userDetails, trips});

        } catch(err){
            if (err) console.log('error', err)
        }
    };

        static async handledropOff (req, res) {
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
            //driver_status: 'ONGOING',
            destination_coordinate: req.body.coordinate, // come back to this
            driver_arrival_time: getDate(), // come back to this also put this in an environment where you can get the it and use it multiple times
            arrival_meter_reading: req.body.meter_reading, // cb
            arrival_fuel_reading: req.body.fuel_reading, // cb
            driver_arrived_destination: true,
            driver_return_journey: true

        };

        console.log('The query to drop off drive is:', query)
        console.log('trip pickup coordinate', req.body.pickup_try)
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

        
        const query = {
            assigned_vehicle: trip.assigned_vehicle,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            driver_status: 'COMPLETED',
            departure_time: getDate(),
            driver_arrived_office: true,
            driver_arrived_office_time: getDate(),
            arrived_office_meter_reading: req.body.meter_reading,
            arrived_office_fuel_reading: req.body.fuel_reading,
        };
        console.log('The query for driver end:', query)
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
            const {result, resbody} = await stafftripStart(token);
            // const {result1, resbody1} = await  tripStart(token);
            const trips = resbody
            console.log('this is the result of the fist one staffstart', resbody)
            // console.log('this is the result of the second one tripstart', resbody1)
            // may need to come back here to restructure this.
            // if (result1.statusCode == 200) {
                
            //     req.session.trip_info = resbody1
            // } else {
            //     req.session.trip_info = []
            // }
            req.session.trips = trips;
            // may need to come back here and include the validation logic to check the states of these things
            if (result.statusCode == '200') {
                res.render('staffStartTrip', {userDetails, trips});
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
        const trip = req.session.trips[0]
        console.log('the trip is', trip)
        console.log('the trip is', trip.trip_details[0])
        const trip_info = req.session.trip_info
        const id = trip.trip_details[0].id

        try{
            
            
            // const {result, resbody} = await tripStart(token);
            // const trips = resbody

            // tell him to pass all the values you see in the query

            // revise this section tell him to add it to the driver thing
            // also come back to the driver to see if you can get details if you log out during the trip
            const query = {
                assigned_vehicle: trip.id,
                departure_meter_reading: trip.trip_details[0].departure_meter_reading,
                departure_fuel_reading: trip.trip_details[0].departure_fuel_reading,
                pickup_address: trip.trip_details[0].pickup_address,
                pickup_coordinate: trip.trip_details[0].pickup_coordinate,
                requester_status: 'ONGOING',
            };

            console.log('The query to start drive is for staff:', query)

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
        const trip =  req.session.trips[0]
        const id = trip.trip_details[0].id

        const query = {
            assigned_vehicle: trip.id,
            departure_meter_reading: trip.trip_details[0].departure_meter_reading,
            departure_fuel_reading: trip.trip_details[0].departure_fuel_reading,
            pickup_address: trip.trip_details[0].pickup_address,
            pickup_coordinate: trip.trip_details[0].pickup_coordinate,
            requester_status: 'COMPLETED',
            requester_arrival_time: getDate(),
            requester_dropped_off: true,
            requester_rate_driver: 'high_satisfactory'//req.body.level,
            // remember
        };
        console.log('the end trip query is ', query)

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