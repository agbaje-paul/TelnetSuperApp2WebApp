const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
     res.render('individual_request');
 });

module.exports = router;