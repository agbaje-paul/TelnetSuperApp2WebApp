const express = require('express');
const router = express.Router();
const controllers = require('../controllers')



//loading the module into the folder.
const auth_routes = require('./auth_routes');
const manage = require('./manage')

// the routers for this function
router.use(auth_routes);
router.use('/manage', manage)

// 
module.exports = router;