const  {facilities_queries} = require('../queries/index');
const {} = require('../utils/query_util');
const {resMessageRedirect} = require('../utils/reusables')

//store the list of the queries
const {
    sendRequest,
    getDrivers,
    listVehicle
} = facilities_queries;

class Facilities {

    //this is to render the page to add a vehicle
    static async addVehicle (req, res) {
        const userDetails = req.session.userDetails
        // come back to think about this cause there's no where else to redirect this thing to
        try{
            const {result, resbody} = await getDrivers();
            if (result.statusCode == '200') {
                const drivers = resbody
                res.render('addVehicle', {userDetails, drivers})
            } else {
                console.log('Not getting drivers')
            }
        } catch(err){
            if (err) console.log('error', err)
        }
    };

    // this is to post the data from the table to the database
    static async handleAddVehicle (req, res) {
        const userDetails = req.session.userDetails
        const token = userDetails.token

        const query = {
            "plate": req.body.plate,
            "type": req.body.type,
            "chasis": req.body.chasis,
            "vin": req.body.vin,
            "vmake": req.body.vmake,
            "vmodel": req.body.vmodel,
            "vcolor": req.body.vcolor,
            "fuel_type": req.body.fuel_type,
            "driver": req.body.driver
        };

        console.log('The car request query', query);

        try{

            // you may need to add logic for the 200 response because it hs some messages that is worth seen
            const {result, resbody} = await sendRequest(query, token);
            console.log(resbody);
            if (result.statusCode == 201) {
                console.log('hi')
                resMessageRedirect(res, req, 'success_msg', 'You have succesfully added a new vehicle', '/facilities/addVehicle' )
            } else if (result.statusCode == 401) {
                resMessageRedirect(res, req, 'error_msg', 'You have failed to add a new vehicle', '/facilities/addVehicle' )
            } else {
                resMessageRedirect(res, req, 'error_msg', 'Something went wrong, contact IT', '/facilities/addVehicle' )
            };
            
        } catch (err) {
            if (err) console.log('Error', err)
        }
    };

    static async vehicleList (req, res) {
        const userDetails = req.session.userDetails;
        const token = userDetails.token;
        
        try {
            const {result, resbody} = await listVehicle(token);
            const vehicles = resbody
            if (result.statusCode == 200) {
                res.render('assignVehicleShow', {userDetails, request, vehicles});
            } else if (result.statusCode == 401){
                req.flash('error_msg', resbody.detail);
                res.redirect('/dashboard')
            }
        }catch(err) {
            if (err) return console.error('Error', err);
        }

    };
};

module.exports = Facilities