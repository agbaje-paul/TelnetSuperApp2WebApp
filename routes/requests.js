const express = require('express');
const router = express.Router();
const { checkSession} = require('../middlewares/checksession');
const {driverAuthorize, supervisorAuthorize} = require('../middlewares/authorization')

// require the list of request controllers
const {request_controllers} = require('../controllers/index')

// the list of the controllers
const {
    createRequest,
    handleRequest,
    viewRequest,
    memberRequest,
    myRequest,
    uplineApprove,
    viewmanageRequest,
    manageMemberRequest,
    manageUplineApprove,
    assignVehicle,
    handleAssignVehicle
} = request_controllers;

router.get('/create_request',checkSession, createRequest);
router.post('/create_request', handleRequest);

router.get('/view_request', [checkSession, supervisorAuthorize], viewRequest);
router.get('/individual_request', [checkSession, supervisorAuthorize], memberRequest);

router.post('/individual_request', [checkSession, supervisorAuthorize], uplineApprove);

//this is for the driver admin to be able to accept or reject requests;
router.get('/viewmanage_request', [checkSession, driverAuthorize], viewmanageRequest);

router.get('/viewindividual_request', [checkSession, driverAuthorize], manageMemberRequest);

router.post('/viewindividual_request', [checkSession, driverAuthorize], manageUplineApprove);

// this is to assign a vehicle to a client once the request has been approved

router.get('/assign_vehicle', [checkSession, driverAuthorize], assignVehicle);
router.get('/handleassign_vehicle', [checkSession, driverAuthorize], handleAssignVehicle)

// get's the list of the request to be managed


// get all the request for the staff
router.get('/my_request', checkSession, myRequest);

module.exports = router;