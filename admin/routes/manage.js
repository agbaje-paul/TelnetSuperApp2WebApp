const express = require('express');
const router = express.Router();
const { adminCheckSession} = require('../../middlewares/checksession');
const {} = require('../../middlewares/authorization')

// require the list of request controllers
const {admin_manage_controllers} = require('../controllers/index')

// the list of the controllers
const {
    getActiveUsers,
    viewActiveUsers,
    handleViewActiveUsers,
    getInActiveUsers,
    viewInActiveUsers,
    handleViewInActiveUsers,
    createUsers,
    handleCreateUsers,
    createUsersResponse,
    createSingleUsers,
    handleCreateSingleUsers,
    failedUsers,
    handleFailedUsers,
    getFailedUsers
} = admin_manage_controllers;



// this route is used to get the list of all active users
router.get('/getActiveUsers', [adminCheckSession], getActiveUsers);

// this is the route to view all the users
router.get('/viewActiveUsers', [adminCheckSession], viewActiveUsers);
router.post('/viewActiveUsers', [adminCheckSession], handleViewActiveUsers);

// this are the routes for the inactive users 
router.get('/getInActiveUsers', [adminCheckSession], getInActiveUsers);

// this is the route to view all the users
router.get('/viewInActiveUsers', [adminCheckSession], viewInActiveUsers);
router.post('/viewInActiveUsers', [adminCheckSession], handleViewInActiveUsers);

// this part is to add users to the platform.
router.get('/createUsers', [adminCheckSession], createUsers)
router.post('/createUsers', [adminCheckSession], handleCreateUsers)

router.get('/createUsersResponse', adminCheckSession, createUsersResponse) // you have to come back wehn ay sends the new response and then create an avenue to post the request get the token and then post the one then splice the ones that have been completely updated.

// this part is to add individual users to the platform
router.get('/createSingleUsers', [adminCheckSession], createSingleUsers)
router.post('/createSingleUsers', [adminCheckSession], handleCreateSingleUsers)

//for failed users
router.get('/get_failed_users', [adminCheckSession], getFailedUsers)
router.get('/failed_users', [adminCheckSession], failedUsers)
router.post('/failed_users', [adminCheckSession], handleFailedUsers)

module.exports = router;