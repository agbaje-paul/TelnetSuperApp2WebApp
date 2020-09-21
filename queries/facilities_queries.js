const {getResponse_request, postResponse_request, putResponse, postResponse, getResponse_get}  = require('../utils/query_util');

class vehicle_queries {

    static async sendRequest(query, token) {
        const url = 'vehicle/vehicle';
        try {
            const {result, resbody} = await postResponse_request(query, url, token)
            return {result, resbody}
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };

    static async getDrivers() {
        const url = 'accounts/drivers';
        try {
            const {result, resbody} = await getResponse_get(url)
            return {result, resbody}
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };
};

module.exports =  vehicle_queries;