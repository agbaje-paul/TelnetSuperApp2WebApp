const {getResponse_request, postResponse_request, putResponse, postResponse, getResponse_get}  = require('../utils/query_util');

class Logistic_queries {

    static async tripList(token) {
        const url = 'core/driver_trip';
        try {
            const {result, resbody} = await getResponse_request(url, token)
            return {result, resbody}
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };

    static async tripCreate(query, token) {
        const url = 'core/trip';
        try {
            const {result, resbody} = await postResponse_request(query, url, token)
            return {result, resbody}
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };

    static async tripStart(token) {
        const url = 'core/driver_recent_trip';
        try {
            const {result, resbody} = await getResponse_request(url, token)
            return {result, resbody}
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };

    static async updateDriverStatus(query, token, id) {
        const url = `core/trip/${id}`;
        try {
            const {result, resbody} = await putResponse(query, url, token)
            return {result, resbody};
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    }; 
    
    static async stafftripStart(token) {
        const url = 'core/staff_track_request';
        try {
            const {result, resbody} = await getResponse_request(url, token)
            return {result, resbody}
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    }; 
};

module.exports =  Logistic_queries;