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
    staffStartTrip,
    staffHandleStartTrip,
    staffEndTrip
} = logistics_controllers;

// this is used to the get the list of trips for a particular driver.
router.get('/getTrip', [checkSession], getTrips),

router.get('/createTrip', [checkSession], createTrip),
router.post('/createTrip', [checkSession], handlecreateTrip),

// this are the routes to start the trip
router.get('/startTrip', [checkSession], startTrip),
router.get('/handleStartTrip', [checkSession], handleStartTrip),

router.get('/dropOff', checkSession, dropOff)
router.get('/endTrip', [checkSession], endTrip)

//theses are the routes for the staff to start and end the trips they have.
router.get('/staffStartTrip', [checkSession], staffStartTrip),
router.get('/staffHandleStartTrip', [checkSession], staffHandleStartTrip),

router.get('/staffEndTrip', [checkSession], staffEndTrip)

module.exports = router;