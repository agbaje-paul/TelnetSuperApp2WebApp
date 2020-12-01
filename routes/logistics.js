const express = require('express');
const router = express.Router();
const { checkSession} = require('../middlewares/checksession');
const {driverAuthorize, supervisorAuthorize} = require('../middlewares/authorization')

// require the list of request controllers
const {logistics_controllers} = require('../controllers/index')

// the list of the controllers
const {
    getTrips,
    createTrip,
    handlecreateTrip,
    endTrip,
    startTrip,
    handleStartTrip,
    dropOff,
    handledropOff,
    staffStartTrip,
    staffHandleStartTrip,
    staffEndTrip,
    waitdropOff,
    waithandledropOff,
    waitreturn,
    handlewaitreturn,
    staffDropoff,
    startMultipleTrip,
    multipleDropoff,
    handleStartMultipleTrip,
    handleMultipleDropOff,
    multipleStartTrip,
    handleMultipleStartTrip,
    multipleReturnToOffice,
    handlemultipleReturnToOffice,
    multipleEndTrip,
    hanelMultipleEndTrip,
    //handleStartMultipleTrip
    //handlestaffDropoff
    staffStartMultipleTrip,
    staffHandleStartMultipleTrip,
    staffMultipleDropoff,
    staffhandleMultipleDropOff,
    staffMultipleStartTrip,
    staffHandleMultipleStartTrip,
    staffMultipleReturnToOffice,
    staffHandlemultipleReturnToOffice,
    staffMultipleEndTrip,
    staffHanelMultipleEndTrip
    
} = logistics_controllers;

//you need to change some of these to post requests

// this is used to the get the list of trips for a particular driver.
router.get('/getTrip', [checkSession], getTrips)

router.get('/createTrip', [checkSession], createTrip)
router.post('/createTrip', [checkSession], handlecreateTrip)

// this are the routes to start the trip
router.get('/startTrip', [checkSession], startTrip)
router.get('/handleStartTrip', [checkSession], handleStartTrip)

router.get('/dropOff', checkSession, dropOff)
router.post('/dropOff', checkSession, handledropOff)

// this is the drop off for the waitforme section
router.get('/waitDropOff', checkSession, waitdropOff)
router.post('/waitDropOff', checkSession, waithandledropOff)

// this is the section that deals with the waitforme return to office
router.get('/waitreturn', checkSession, waitreturn)
router.post('/waitreturn', checkSession, handlewaitreturn)

router.post('/endTrip', [checkSession], endTrip)
//router.post('/endTrip', [checkSession], handleendTrip)

//theses are the routes for the staff to start and end the trips they have.
router.get('/staffStartTrip', [checkSession], staffStartTrip)

// //this is the part that has to deal with the drop off of staff
 router.get('/staffDropoff', [checkSession], staffDropoff)
// //router.post('/staffDropoff', [checkSession], handlestaffDropoff)

router.get('/staffHandleStartTrip', [checkSession], staffHandleStartTrip)

router.post('/staffEndTrip', [checkSession], staffEndTrip)

// this section deals with the multiple section of the request; the format here is different to the implementation of the rest to avoid confusion, here at the start trip section the request is entirely routed to a new section where the implemetation is carried out.
router.get('/start_trip', [checkSession], startMultipleTrip);
router.post('/start_trip', [checkSession], handleStartMultipleTrip);

// this is the drop off route for all the trips you are going on
router.get('/multiple_dropoff',  [checkSession], multipleDropoff)
router.post('/multiple_dropoff', [checkSession], handleMultipleDropOff);

//this is for the starting trip of the different parts of the multiple trip
router.get('/multiple_startTrip',  [checkSession], multipleStartTrip)
router.post('/multiple_StartTrip', [checkSession], handleMultipleStartTrip)

//this area is for the return to office section
router.get('/multiple_returnToOffice',  [checkSession], multipleReturnToOffice)
router.post('/multiple_returnToOffice', [checkSession], handlemultipleReturnToOffice)

//this is the route to end trips
router.get('/multiple_endTrip',  [checkSession], multipleEndTrip)
router.post('/multiple_endTrip',  [checkSession], hanelMultipleEndTrip)

// THIS SECTION REPRESENTS THE STAFF SECTION

router.get('/staff_start_trip', [checkSession], staffStartMultipleTrip);
router.post('/staff_start_trip', [checkSession], staffHandleStartMultipleTrip);

// this is the drop off route for all the trips you are going on
router.get('/staff_multiple_dropoff',  [checkSession], staffMultipleDropoff)
router.post('/staff_multiple_dropoff', [checkSession], staffhandleMultipleDropOff);

//this is for the starting trip of the different parts of the multiple trip
router.get('/staff_multiple_startTrip',  [checkSession], staffMultipleStartTrip)
router.post('/staff_multiple_StartTrip', [checkSession], staffHandleMultipleStartTrip)

//this area is for the return to office section
router.get('/staff_multiple_returnToOffice',  [checkSession], staffMultipleReturnToOffice)
router.post('/staff_multiple_returnToOffice', [checkSession], staffHandlemultipleReturnToOffice)

//this is the route to end trips
router.get('/staff_multiple_endTrip',  [checkSession], staffMultipleEndTrip)
router.post('/staff_multiple_endTrip',  [checkSession], staffHanelMultipleEndTrip)

module.exports = router;