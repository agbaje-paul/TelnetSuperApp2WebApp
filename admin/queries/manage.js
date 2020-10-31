const { getResponse, getResponse_get, getResponse_request, putResponse, postResponse_request } = require('../../utils/query_util');

class admin_manage_queries {


    //Get list of the users that can approve members
    static async getUsers(token) {
        const url = 'accounts/active_users';
        try {
            const { result, resbody } = await getResponse_request(url, token)
            return { result, resbody }

        } catch (err) {
            if (err) console.log('login error', err)
        }
    };

    static async getInactiveUsers(token) {
        const url = 'accounts/inactive_users';
        try {
            const { result, resbody } = await getResponse_request(url, token)
            return { result, resbody }

        } catch (err) {
            if (err) console.log('login error', err)
        }
    };


    //update the account of a user
    static async updateUsers(query, token, user_id) {
        const url = `accounts/user/${user_id}`;
        try {
            const { result, resbody } = await putResponse(query, url, token)
            return { result, resbody }

        } catch (err) {
            if (err) console.log('login error', err)
        }
    };

    static async bulkUpload(query, token) {
        const url = 'accounts/bulk_upload';
        try {
            const { result, resbody } = await postResponse_request(query, url, token)
            return { result, resbody }

        } catch (err) {
            if (err) console.log('login error', err)
        }
    }; 

    static async singleUpload(query) {
        const url = 'accounts/register';
        try {
            const { result, resbody } = await getResponse(query, url)
            return { result, resbody }

        } catch (err) {
            if (err) console.log('login error', err)
        }
    };
    static async getSubs () {
        const url = 'accounts/subsidiaries';

        try {
            const {result, resbody} = await getResponse_get(url)
            return {result, resbody}
            
        }catch(err){
            if (err) console.log('login error', err)
        }
    };  

};

module.exports = admin_manage_queries