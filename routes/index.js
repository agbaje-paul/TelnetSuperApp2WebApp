const express = require('express');
const router = express.Router();
const controllers = require('../controllers')

//middleware
//const middleware = require('')

//loading the module into the folder.
const auth_routes = require('./auth_routes');
const requests = require('./requests');
const logistics = require('./logistics');
const facilities = require('./facilities');
// const manage = require('./manage');
// const reports = require('./reports');

//middleware route
//router.use(middleware)

// the routers for this function
router.use(auth_routes);
router.use('/requests', requests);
router.use('/logistics', logistics)
router.use('/facilities', facilities);
// router.use('/manage', manage);
// router.use('/reports', reports);

// 
module.exports = router;