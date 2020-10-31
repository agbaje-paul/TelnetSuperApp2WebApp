const {getResponse, getResponse_get} = require('../../utils/query_util');

class auth_queries {


    //Get list of the users that can approve members
    static async getUsers () {
        const url = 'accounts/all_users';

        try {
            const {result, resbody} = await getResponse_get(url)
            return {result, resbody}

        }catch(err){
            if (err) console.log('login error', err)
        }
    };

    //Get list of the subsidiaries
    static async getSubs () {
        const url = 'accounts/subsidiaries';

        try {
            const {result, resbody} = await getResponse_get(url)
            return {result, resbody}
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };    

    //Get list of the departments
    static async getDeb () {
        const url = 'accounts/departments';

        try {
            const {result, resbody} = await getResponse_get(url)
            return {result, resbody}
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };

    // static async getDeb1 (id) {
    //     const url = `accounts/department/${id}`;

    //     try {
    //         const {result, resbody} = await getResponse_get(url)
    //         return {result, resbody}
            
    //     }catch(err){
    //         if (err) console.log('login error', err)
    //     }
    // };

    //create a new member.
    static async createRegister(query) {
        const url = 'accounts/register'
        try {
            const {result, resbody} = await getResponse(query, url);
            return {result, resbody};
        }catch(err){
            if (err) return console.log(error)
        }

    };

    static async loginRequest (query) {
        const url = 'accounts/login';

        try {

            const {result, resbody} = await getResponse(query, url);
            return {result, resbody}
        } catch(err){
            if (err) console.log('login error', err)
        }
    }
};

module.exports = auth_queries