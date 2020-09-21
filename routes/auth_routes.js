const express = require('express');
const router = express.Router();
const { forwardAuthenticate, checkSession} = require('../middlewares/checksession');


//require the controllers from the controllers route
const { auth_controllers} = require('../controllers/index');


//define all the controllers in this route.
const {
    displayRegister,
    handleRegister,
    displayLogin,
    handleLogin,
    displayDashboard,
    logout,
    authorization,
    handleDeps
} = auth_controllers;

router.get('/register', displayRegister);
router.post('/register', handleRegister)

// this was an attempt to use this route to get the values in ajax in the request page.
// router.get('/departments', handleDeps)

router.get('/login', forwardAuthenticate, displayLogin);
router.post('/login', handleLogin);

router.get('/dashboard', checkSession, displayDashboard);

router.get('/authorization', authorization);

router.get('/logout', logout);


module.exports = router;