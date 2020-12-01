const { logistics_queries } = require('../queries/index');
const { } = require('../utils/query_util');
const { resMessageRedirect, getDate, checkRequest, multipleRequestPosition } = require('../utils/reusables');

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
    static async getTrips(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        // come back to think about this cause there's no where else to redirect this thing to
        try {
            const { result, resbody } = await tripList(token);
            var trips = resbody
            console.log(trips)
            trips = [trips]
            // may need to come back here and include the validation logic to check the states of these things
            req.session.create_trip = trips
            res.render('tripsList', { userDetails, trips });

        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    // this is used to start the trip
    static async createTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const create_trip = req.session.create_trip // this is where the details of the trip is used to create the trip

        try {
            const vehicle_id = req.query.id;
            req.session.vehicle_id = vehicle_id;
            console.log('vehicle id', req.session.vehicle_id)
            res.render('createTrip', { userDetails, create_trip });

        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async handlecreateTrip(req, res) {
        const userDetails = req.session.userDetails;
        const token = userDetails.token;
        const vehicle_id = req.session.vehicle_id;

        var query;
        if (req.body.locations) {
            var list = []
            var locations = JSON.parse(req.body.locations);
            console.log(locations)
            locations.forEach((item, index) => {
                var location = {
                    order: index + 1,
                    location: item
                };
                list.push(location)
            });

            query = {
                assigned_vehicle: vehicle_id,
                departure_meter_reading: req.body.departure_meter_reading,
                departure_fuel_reading: req.body.departure_fuel_reading,
                pickup_address: req.body.pickup_address,
                pickup_coordinate: req.body.pickup_coordinate,
                multitrip_set: list
            };
        } else {
            query = {
                assigned_vehicle: vehicle_id,
                departure_meter_reading: req.body.departure_meter_reading,
                departure_fuel_reading: req.body.departure_fuel_reading,
                pickup_address: req.body.pickup_address,
                pickup_coordinate: req.body.pickup_coordinate
            };
        }


        console.log('trip creation query is ', query)

        try {
            const { result, resbody } = await tripCreate(query, token)
            console.log(result.statusCode)
            console.log(resbody)
            if (result.statusCode == '201') {
                req.session.created_trip = resbody
                resMessageRedirect(res, req, 'success_msg', 'Your trip has registered', '/logistics/getTrip')

            } else {
                // you have to come back to refactor
                resMessageRedirect(res, req, 'error_msg', 'Your trip could not be registered contact admin', '/logistics/getTrip')
            };
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async startTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const created_trip = req.session.created_trip;
        try {
            const { result, resbody } = await tripStart(token);
            var trips = resbody
            var trip = [trips]
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                if (trip.trip_type == 'multiple') return res.redirect('/logistics/start_trip')


                if (trip.driver_status == 'STARTED') {
                    if (trip[0].request_type == 'waitforme') {
                        return res.redirect('/logistics/waitDropoff');
                    }
                    return res.redirect('/logistics/dropOff')
                } else {
                    // trip = trip.filter(function (trip) {
                    //     return trip.driver_arrived_destination == false
                    // });

                    req.session.started_trip = trip[0];
                    res.render('startTrip', { userDetails, trip });
                }

            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/getTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async handleStartTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.started_trip
        const id = trip.trip_id

        const query = {
            assigned_vehicle: trip.assigned_vehicle_id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            driver_status: 'STARTED',
            departure_time: getDate()
        };

        console.log('The query to start drive is for driver:', query)
        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);
            const trips = resbody
            console.log('this is the trip', trips)
            req.session.trips_dropoff = trips
            if (result.statusCode == '200') {
                console.log('this is trips 0', trips)
                if (trips.request_type == 'waitforme' && trips.trip_type == 'single') { // do this for everything
                    return res.redirect('/logistics/waitDropoff')
                }
                res.redirect('/logistics/dropoff')
                //res.render('tripStarted', {userDetails, trips});
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/getTrip')
            }

            // may need to come back here and include the validation logic to check the states of these things


        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async waitdropOff(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        //const trips = req.session.trips_dropoff
        // come back to think about this cause there's no where else to redirect this thing to
        try {
            const { result, resbody } = await tripStart(token);
            const trips = resbody
            // may need to come back here and include the validation logic to check the states of these things
            if (result.statusCode == '200') {
                var trip = trips
                req.session.started_trip = trip
                res.render('waittripStarted', { userDetails, trips });
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong start this trip again', '/logistics/startTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async dropOff(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        //const trips = req.session.trips_dropoff
        // come back to think about this cause there's no where else to redirect this thing to
        try {
            const { result, resbody } = await tripStart(token);
            var trips = resbody
            var trip = [trips]
            // may need to come back here and include the validation logic to check the states of these things
            if (result.statusCode == '200') {
                req.session.started_trip = trip[0]
                res.render('tripStarted', { userDetails, trips });
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong start this trip again', '/logistics/startTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async handledropOff(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.started_trip
        console.log('the trip that is failing', trip)
        const id = trip.trip_id


        const query = {
            assigned_vehicle: trip.assigned_vehicle_id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            //driver_status: 'ONGOING',
            destination_coordinate: '13455',//req.body.coordinate, // come back to this //Yvone this is for you know destination coordinates no google api
            driver_arrival_time: getDate(), // come back to this also put this in an environment where you can get the it and use it multiple times
            arrival_meter_reading: req.body.meter, // cb
            arrival_fuel_reading: req.body.fuel, // cb
            driver_arrived_destination: true,
            driver_return_journey: true

        };

        console.log('The query to drop off drive is:', query)
        console.log('trip pickup coordinate', req.body.pickup_try)
        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);
            const trips = resbody
            if (result.statusCode == '200') {
                res.render('tripStarted2', { userDetails, trips });
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/startTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/startTrip')
            }

            // may need to come back here and include the validation logic to check the states of these things


        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async waithandledropOff(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.started_trip
        const id = trip.trip_id


        const query = {
            assigned_vehicle: trip.assigned_vehicle_id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            //driver_status: 'ONGOING',
            destination_coordinate: req.body.coordinate, // come back to this
            driver_arrival_time: getDate(), // come back to this also put this in an environment where you can get the it and use it multiple times
            arrival_meter_reading: req.body.meter, // cb
            arrival_fuel_reading: req.body.fuel, // cb
            driver_arrived_destination: true,
            //driver_return_journey: true

        };

        console.log('The query to drop off drive is:', query)
        console.log('trip pickup coordinate', req.body.pickup_try)
        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);
            const trips = resbody
            if (result.statusCode == '200') {
                res.redirect('/logistics/waitreturn')
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/startTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/startTrip')
            }

            // may need to come back here and include the validation logic to check the states of these things


        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async waitreturn(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        //const trips = req.session.trips_dropoff
        // come back to think about this cause there's no where else to redirect this thing to
        try {
            const { result, resbody } = await tripStart(token);
            const trips = resbody
            // may need to come back here and include the validation logic to check the states of these things
            if (result.statusCode == '200') {
                var trip = trips
                req.session.started_trip = trip
                res.render('waittripStarted2', { userDetails, trips });
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong start this trip again', '/logistics/startTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async handlewaitreturn(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.started_trip
        const id = trip.trip_id


        const query = {
            assigned_vehicle: trip.assigned_vehicle_id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            driver_return_journey: true

        };

        console.log('The query to drop off drive is:', query)
        console.log('trip pickup coordinate', req.body.pickup_try)
        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);
            const trips = resbody
            if (result.statusCode == '200') {
                res.render('tripStarted2', { userDetails, trips });
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/startTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/startTrip')
            }

            // may need to come back here and include the validation logic to check the states of these things


        } catch (err) {
            if (err) console.log('error', err)
        }
    };


    static async endTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.started_trip
        const id = trip.trip_id
        console.log('the trip id for the end trip is', id)

        const query = {
            assigned_vehicle: trip.assigned_vehicle_id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            driver_status: 'COMPLETED',
            driver_arrived_office: true,
            driver_arrived_office_time: getDate(),
            arrived_office_meter_reading: req.body.meter,
            arrived_office_fuel_reading: req.body.fuel,
        };
        console.log('The query for driver end:', query)
        try {

            const { result, resbody } = await updateDriverStatus(query, token, id);
            const trips = resbody
            if (result.statusCode == '200') {
                resMessageRedirect(res, req, 'success_msg', 'You have completed your trip', '/logistics/startTrip');
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/startTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/startTrip')
            }

            // may need to come back here and include the validation logic to check the states of these things

        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async staffStartTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const created_trip = req.session.created_trip;
        try {
            const { result, resbody } = await stafftripStart(token);
            var trips = resbody
            console.log('this is the result of the fist one staffstart', resbody)
            req.session.trips = trips;
            // may need to come back here and include the validation logic to check the states of these things
            if (result.statusCode == '200') {
                console.log('hey', trips.trip_type)
                if (trips[0].trip_type == 'multiple') return res.redirect('/logistics/staff_start_trip')
                console.log('hi')
                var trip = trips
                res.render('staffStartTrip', { userDetails, trip, trips });
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/dashboard')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/dashboard')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async staffHandleStartTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.trips[0]
        console.log('the trip is', trip)
        console.log('the trip is', trip.trip_details[0])
        const trip_info = req.session.trip_info
        const id = trip.trip_details[0].id
        console.log(id)

        try {


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
                requester_status: 'STARTED',
            };

            console.log('The query to start drive is for staff:', query)

            const { result, resbody } = await updateDriverStatus(query, token, id);
            const trips = resbody
            console.log('this is the resbody for the staff see something', resbody)
            if (result.statusCode == '200') {
                if (trips.request_type == 'waitforme') {
                    return res.render('waitArrived', { userDetails, trip, trips });
                }
                res.render('staffTripStarted', { userDetails, trips });
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }

            // may need to come back here and include the validation logic to check the states of these things


        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async staffDropoff(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.trips[0]
        const id = trip.trip_details[0].id

        const query = {
            assigned_vehicle: trip.id,
            departure_meter_reading: trip.trip_details[0].departure_meter_reading,
            departure_fuel_reading: trip.trip_details[0].departure_fuel_reading,
            pickup_address: trip.trip_details[0].pickup_address,
            pickup_coordinate: trip.trip_details[0].pickup_coordinate,
            requester_status: 'ARRIVED_DESTINATION',
            requester_arrival_time: getDate(),
        };
        console.log('the end trip query is ', query)

        try {

            const { result, resbody } = await updateDriverStatus(query, token, id);
            const trips = resbody
            if (result.statusCode == '200') {
                res.render('staffTripStarted', { userDetails, trips });
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }

            // may need to come back here and include the validation logic to check the states of these things

        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async staffEndTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.trips[0]
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
            requester_rate_driver: req.body.level,
            // remember
        };
        console.log('the end trip query is ', query)

        try {

            const { result, resbody } = await updateDriverStatus(query, token, id);
            const trips = resbody
            if (result.statusCode == '200') {
                resMessageRedirect(res, req, 'success_msg', 'You have completed your trip', '/logistics/staffStartTrip');
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }

            // may need to come back here and include the validation logic to check the states of these things

        } catch (err) {
            if (err) console.log('error', err)
        }
    };


    static async startMultipleTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token

        try {
            const { result, resbody } = await tripStart(token);
            const trip = resbody
            req.session.multiple_trip = trip
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                //multipleRequestPosition(req, res, trip)
                console.log("this is the trip status you are interested in", trip)
                res.render('startTripMultiple', { userDetails, trip });


            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/getTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async handleStartMultipleTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.multiple_trip;
        const id = trip.trip_id
        var multitrip_set = trip.trip_info.filter(function (item) {
            return item.order == "1"
        });
        multitrip_set = [
            {
                order: multitrip_set[0].order,
                driver_status: "STARTED"
            }
        ]

        const query = {
            assigned_vehicle: trip.id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            departure_time: getDate(),
            multitrip_set: multitrip_set
        };

        console.log('the query of the multiple handlestartmultiple', query)

        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);;
            const trip_details = resbody
            console.log(trip_details)
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                res.redirect('/logistics/multiple_dropoff');
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/getTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };
    
    // this may have to  have its own.
    // shouldn't there be like a multiple drop off start. yh the start is the part that'll carry the post of the other request, so this will be the part that you'll update the users details
    static async multipleDropoff (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token

        try {
            const { result, resbody } = await tripStart(token);
            const trip = resbody
            req.session.multiple_trip = trip
            var trip_info = trip.trip_info;

            trip_info = trip_info.filter(function (item) {
                return item.driver_status == "STARTED"
            });
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                //multipleRequestPosition(req, res, trip)
                console.log("this is the trip status you are interested in", trip)
                res.render('dropOffMultiple', { userDetails, trip, trip_info });

            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/getTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async handleMultipleDropOff(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.multiple_trip;
        const id = trip.trip_id
        console.log('the trip order', req.body.tripValue)

        var multitrip_set = trip.trip_info.filter(function (item) {
            return item.order == req.body.tripValue
        });
        multitrip_set = [
            {
                order: multitrip_set[0].order,
                driver_status: "COMPLETED",
                destination_coordinate: req.body.pickup_coordinate,
                driver_arrived_destination: true,
                driver_arrival_time: getDate(),
                arrival_meter_reading: req.body.meter,
                arrival_fuel_reading: req.body.fuel
            }
        ]

        const query = {
            assigned_vehicle: trip.id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            multitrip_set: multitrip_set
        };

        console.log('the query of the multiple handlestart drop off', query)

        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);;
            const trip_details = resbody
            console.log(trip_details)
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                res.redirect('/logistics/multiple_startTrip');
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/getTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async multipleStartTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token

        try {
            const { result, resbody } = await tripStart(token);
            const trip = resbody
            req.session.multiple_trip = trip
            // may need to come back here and include the validation logic to check the states of these things
            var trip_info = trip.trip_info;

            trip_info = trip_info.filter(function (item) {
                return item.driver_status == "REQUESTED"
            });

            console.log('the trip info highlighted here', trip_info)
            if (trip_info[0] == undefined) return res.redirect('/logistics/multiple_returnToOffice') // comeback to this.
            if (result.statusCode == '200') {
                //multipleRequestPosition(req, res, trip)
                console.log("this is the trip status you are interested in", trip)
                res.render('startNewTrip', { userDetails, trip, trip_info });


            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/getTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async handleMultipleStartTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.multiple_trip;
        const id = trip.trip_id
        console.log('the trip order', req.body.destination)

        var multitrip_set = trip.trip_info.filter(function (item) {
            return item.location == req.body.destination
        });
        multitrip_set = [
            {
                order: multitrip_set[0].order,
                driver_status: "STARTED"
            }
        ]

        const query = {
            assigned_vehicle: trip.id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            multitrip_set: multitrip_set
        };

        console.log('the query of the start trip after the start trip is', query)

        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);;
            const trip_details = resbody
            console.log(trip_details)
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                res.redirect('/logistics/multiple_dropoff');
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/getTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async multipleReturnToOffice (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token

        try {
            const { result, resbody } = await tripStart(token);


            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                //multipleRequestPosition(req, res, trip)
                const trip = resbody
                req.session.multiple_trip = trip
                var trip_info = trip.trip_info;
                console.log("this is the trip status you are interested in", trip)
                res.render('returnMultiple', { userDetails, trip, trip_info });

            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/getTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async handlemultipleReturnToOffice(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.multiple_trip;
        const id = trip.trip_id

        var multitrip_set = []

        const query = {
            assigned_vehicle: trip.id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            multitrip_set: multitrip_set,
            driver_return_journey: true
        };

        console.log('the query of the return journey', query)

        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);;
            const trip_details = resbody
            console.log(trip_details)
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                res.redirect('/logistics/multiple_endTrip');
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/getTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async multipleEndTrip (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token

        try {
            const { result, resbody } = await tripStart(token);


            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                //multipleRequestPosition(req, res, trip)
                const trip = resbody
                req.session.multiple_trip = trip
                var trip_info = trip.trip_info;
                console.log("this is the trip status you are interested in", trip)
                res.render('endMultipleTrip', { userDetails, trip, trip_info });

            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/getTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async hanelMultipleEndTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        const trip = req.session.multiple_trip;
        const id = trip.trip_id

        var multitrip_set = []

        const query = {
            assigned_vehicle: trip.id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            multitrip_set: multitrip_set,
            driver_arrived_office_time: getDate(),
            driver_arrived_office: true,
            arrived_office_fuel_reading: req.body.fuel,
            arrived_office_meter_reading: req.body.meter,
            driver_status: "COMPLETED"
        };

        console.log('the query of the return journey', query)

        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);;
            const trip_details = resbody
            console.log(trip_details)
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                resMessageRedirect(res, req, 'success_msg', 'Your trip is completed', '/logistics/start_trip');
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/getTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/getTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    // this is the staff section of the multiple trip

    static async staffStartMultipleTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token

        try {
            const { result, resbody } = await stafftripStart(token);
            var trips = resbody
            req.session.multiple_trip = trips
            var trip = trips[0]
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                //multipleRequestPosition(req, res, trip)
                console.log("this is the trip status you are interested in", trip)
                res.render('staffStartTripMultiple', { userDetails, trip });
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async staffHandleStartMultipleTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        var trip = req.session.multiple_trip;
        trip = trip[0]
        console.log('the trip giving you problems', trip)
        const id = trip.trip_id
        var multitrip_set = trip.trip_details.filter(function (item) {
            return item.order == "1"
        });
        multitrip_set = [
            {
                order: multitrip_set[0].order,
                requester_status: "STARTED"
            }
        ]

        const query = {
            assigned_vehicle: trip.id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            multitrip_set: multitrip_set
        };

        console.log('the query of the multiple handlestartmultiple', query)

        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);;
            const trip_details = resbody
            console.log(trip_details)
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                res.redirect('/logistics/staff_multiple_dropoff');
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };
    
    // this may have to  have its own.
    // shouldn't there be like a multiple drop off start. yh the start is the part that'll carry the post of the other request, so this will be the part that you'll update the users details
    static async staffMultipleDropoff (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token

        try {
            const { result, resbody } = await stafftripStart(token);
            const trip = resbody
            req.session.multiple_trip = trip
            var trip_info = trip[0].trip_details;

            trip_info = trip_info.filter(function (item) {
                return item.requester_status == "STARTED"
            });
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                //multipleRequestPosition(req, res, trip)
                console.log("this is the trip status you are interested in", trip)
                res.render('staffDropOffMultiple', { userDetails, trip, trip_info });

            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async staffhandleMultipleDropOff(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        var trip = req.session.multiple_trip;
        trip = trip[0]
        const id = trip.trip_id
        console.log('the trip order', req.body.tripValue)

        var multitrip_set = trip.trip_details.filter(function (item) {
            return item.order == req.body.tripValue
        });
        multitrip_set = [
            {
                order: multitrip_set[0].order,
                requester_status: "ARRIVED_DESTINATION",
                requester_arrived_destination: true,
                requester_arrival_time: getDate()
            }
        ]

        const query = {
            assigned_vehicle: trip.id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            multitrip_set: multitrip_set
        };

        console.log('the query of the multiple handlestart drop off', query)

        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);;
            const trip_details = resbody
            console.log(trip_details)
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                res.redirect('/logistics/staff_multiple_startTrip');
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async staffMultipleStartTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token

        try {
            const { result, resbody } = await stafftripStart(token);
            const trip = resbody
            req.session.multiple_trip = trip
            // may need to come back here and include the validation logic to check the states of these things
            var trip_info = trip[0].trip_details;
            //var trip_details = trip.trip_details

            // trip_details = trip_details.filter(function (item, index) {
            //     return item.requester_status == "REQUESTED"
            // });

            trip_info = trip_info.filter(function (item) {
                return item.requester_status != "ARRIVED_DESTINATION"
            });

            console.log('the trip info highlighted here', trip_info)
            if (trip_info[0] == undefined) return res.redirect('/logistics/staff_multiple_returnToOffice') // comeback to this.
            if (result.statusCode == '200') {
                //multipleRequestPosition(req, res, trip)
                console.log("this is the trip status you are interested in", trip)
                res.render('staffStartNewTrip', { userDetails, trip, trip_info });


            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async staffHandleMultipleStartTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        var trip = req.session.multiple_trip;
        trip = trip[0]
        const id = trip.trip_id
        console.log('the trip order', req.body.destination)

        var multitrip_set = trip.trip_details.filter(function (item) {
            return item.location == req.body.destination
        });
        multitrip_set = [
            {
                order: multitrip_set[0].order,
                requester_status: "STARTED"
            }
        ]

        const query = {
            assigned_vehicle: trip.id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            multitrip_set: multitrip_set
        };

        console.log('the query of the start trip after the start trip is', query)

        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);;
            const trip_details = resbody
            console.log(trip_details)
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                res.redirect('/logistics/staff_multiple_dropoff');
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async staffMultipleReturnToOffice (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token

        try {
            const { result, resbody } = await stafftripStart(token);


            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                //multipleRequestPosition(req, res, trip)
                const trip = resbody
                req.session.multiple_trip = trip
                var trip_info = trip[0].trip_details;
                console.log("this is the trip status you are interested in", trip)
                res.render('staffReturnMultiple', { userDetails, trip, trip_info });

            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async staffHandlemultipleReturnToOffice(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        var trip = req.session.multiple_trip;
        trip = trip[0]
        const id = trip.trip_id

        var multitrip_set = []

        const query = {
            assigned_vehicle: trip.id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            multitrip_set: multitrip_set,
            requester_rate_driver: null ,// come back to this.
            requester_status: "GOING_BACK_TO_OFFICE"
        };

        console.log('the query of the return journey', query)

        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);;
            const trip_details = resbody
            console.log(trip_details)
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                res.redirect('/logistics/staff_multiple_endTrip');
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async staffMultipleEndTrip (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token

        try {
            const { result, resbody } = await stafftripStart(token);


            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                //multipleRequestPosition(req, res, trip)
                const trip = resbody
                req.session.multiple_trip = trip
                var trip_info = trip[0].trip_details;
                console.log("this is the trip status you are interested in", trip)
                res.render('staffEndMultipleTrip', { userDetails, trip, trip_info });

            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };

    static async staffHanelMultipleEndTrip(req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token
        var trip = req.session.multiple_trip;
        trip = trip[0]
        const id = trip.trip_id

        var multitrip_set = []

        const query = {
            assigned_vehicle: trip.id,
            departure_meter_reading: trip.departure_meter_reading,
            departure_fuel_reading: trip.departure_fuel_reading,
            pickup_address: trip.pickup_address,
            pickup_coordinate: trip.pickup_coordinate,
            multitrip_set: multitrip_set,
            requester_rate_driver: req.body.level ,// come back to this.
            requester_status: "BACK_TO_OFFICE"
        };

        console.log('the query of the return journey', query)

        try {
            const { result, resbody } = await updateDriverStatus(query, token, id);;
            const trip_details = resbody
            console.log(trip_details)
            // may need to come back here and include the validation logic to check the states of these things

            if (result.statusCode == '200') {
                resMessageRedirect(res, req, 'success_msg', 'Your trip is completed', '/logistics/staff_start_trip');
            } else if (result.statusCode == '401') {
                resMessageRedirect(res, req, 'error_msg', 'You are not authorized to view this page', '/logistics/staffStartTrip')
                // you may need to add a middleware to make sure only the right personal can see this.
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong contact admin', '/logistics/staffStartTrip')
            }
        } catch (err) {
            if (err) console.log('error', err)
        }
    };
}

module.exports = Logistics