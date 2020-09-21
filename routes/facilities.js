const express = require('express');
const router = express.Router();
const { checkSession} = require('../middlewares/checksession');
const {driverAuthorize, supervisorAuthorize} = require('../middlewares/authorization')

// require the list of request controllers
const {failities_controllers} = require('../controllers/index')

// the list of the controllers
const {
    addVehicle,
    handleAddVehicle
} = failities_controllers;

// handles the addition of vehicles to the database
router.get('/addVehicle', [checkSession, driverAuthorize], addVehicle),
router.post('/addVehicle', [checkSession, driverAuthorize], handleAddVehicle)


module.exports = router;