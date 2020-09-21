//require the express npm package
const express = require('express');
//require the config module
const config = require('config')
//use the express package
const app = express();
//requrie the path module
const path = require('path')
// Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
var bodyParser = require("body-parser");
// require express-session
var session = require("express-session");
// require connect flash
var flash = require('connect-flash');



const routes = require('./routes/index');
const test = require('./test');

// Terminate the node process if the req.session is not working

if(!config.get('sessionPrivatekey')) {
    console.log('you need to store your environment variable')
    throw new Error('The sessionrivatekey has not been set')
};

// set up the view engine
app.set("view engine", "ejs");

// for public content
app.use(express.static(path.join(__dirname) + "/public"));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());



// Initialise the sessions middleware
//app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'shhh',//config.get('sessionPrivatekey'), // this is stored in an environment variable not yet because we are still developing want people to be able to see what i am doing.
  resave: true, // this is set to true for some reason i dont really understand
  saveUninitialized: true,
  // cookie: { secure: true } //  why is this not included 
}))

// Connect flash
app.use(flash());


// Global variables for connect flash
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.errors = req.flash('errors');
  next();
});

// All the routes.
app.use('/', routes)
app.use('/test', test)


//Defining the environment variable and server

var port = process.env.port || 3000;

const server  = app.listen(port, function() {
    const host = server.address().address; // CB i tried to log this server object and could not find this adress method,.. I think this worlds because it is an asynchronous funciton
    const port = server.address().port // CB how can you change this.
    console.log("Server listening on http://%s:%s", host, port)
});
