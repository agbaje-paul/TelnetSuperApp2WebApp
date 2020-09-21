const url = process.env.BaseUrl || 'http://173.212.213.205:8090' // this is for production and live
// i dont understand why we have to set this as it is directly to the db so this should be able to be hardcoded?


module.exports = {
    baseUrl : `${url}/api/v1/`
}