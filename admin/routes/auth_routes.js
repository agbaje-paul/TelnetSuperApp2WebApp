const express = require('express');
const router = express.Router();
const { adminForwardAuthenticate, adminCheckSession} = require('../../middlewares/checksession');


//require the controllers from the controllers route
const { auth_controllers} = require('../controllers/index');


//define all the controllers in this route.
const {
    displayLogin,
    handleLogin,
    displayDashboard,
    logout,
    authorization,
} = auth_controllers;

// for the registration aspect , we are going to add a part that allows a super admin already created to add new super admins.

router.get('/login', adminForwardAuthenticate, displayLogin);
router.post('/login', handleLogin);

router.get('/dashboard', adminCheckSession, displayDashboard);

router.get('/authorization', authorization);

router.get('/logout', logout);


module.exports = router;