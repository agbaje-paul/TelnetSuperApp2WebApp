const {getResponse_request, postResponse_request, putResponse, postResponse}  = require('../utils/query_util');

class vehicle_queries {

    static async sendRequest(query, token) {
        const url = 'core/vrequest';
        try {
            const {result, resbody} = await postResponse_request(query, url, token)
            return {result, resbody}
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };

    static async carRequests(token) {
        const url = 'core/vrequest';
        try {
            const {result, resbody} = await getResponse_request(url, token)
            return {result, resbody}
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };

    static async indRequests(token, id) {
        const url = `core/vrequest/${id}`;
        try {
            const {result, resbody} = await getResponse_request(url, token)
            return {result, resbody}
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };
    getMyRequest

    static async getMyRequest(token) {
        const url = 'core/vrequest/all';
        try {
            const {result, resbody} = await getResponse_request(url, token)
            return {result, resbody};
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };

    static async uplinequery(query, token, id) {
        const url = `core/vrequest/${id}`;
        try {
            const {result, resbody} = await putResponse(query, url, token)
            return {result, resbody};
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    }; 

    static async vehicleAssign(query, token) {
        const url = 'core/assign_vehicle';
        try {
            const {result, resbody} = await postResponse_request(query, url, token)
            return {result, resbody};
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    }; 

    static async listVehicle(token) {
        const url = 'vehicle/available';
        try {
            const {result, resbody} = await getResponse_request(url, token)
            return {result, resbody};
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };
};

module.exports =  vehicle_queries;