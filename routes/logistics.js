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
    //handlestaffDropoff
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

module.exports = router;