// loading the baseUrl
const { baseUrl } = require('../baseUrl')

// require the request module
const request = require('request');


// request(baseUrl, function (error, response, body) {
//   console.error('error:', error); // Print the error if one occurred
//   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//   console.log('body:', body); // Print the HTML for the Google homepage.
// });

class Consumers {
  static getResponse(query, url) {
    return new Promise ( (resolve, reject) => {
    
        const body = JSON.stringify(query);
        const options = {
          headers: {
            'content-Type': 'application/json',
          },
          url: `${baseUrl}${url}`,
          body,
        };
        request.post(options, (error, result, resBody) => {
          if (error) reject(error);
          var resbody = JSON.parse(result.body);
          resolve({result, resbody})
        });
 });
};

static getResponse_get(url) {
  return new Promise ( (resolve, reject) => {

      const options = {
        headers: {
          'content-Type': 'application/json',
        },
        url: `${baseUrl}${url}`
      };
      request.get(options, (error, result, resBody) => {
        if (error) reject(error);
        if (result.statusCode == '500') {
          throw new Error('ERROR 500: Internal server error')
        } else {
          var resbody = JSON.parse(result.body);
          resolve({result, resbody})
        }
      });
});
};
    static postResponse_request(query, url, token) {
      return new Promise ( (resolve, reject) => {
    
        const body = JSON.stringify(query);
        const options = {
          headers: {
            'content-Type': 'application/json',
            'Authorization': `Token ${token}`

          },
          url: `${baseUrl}${url}`,
          body,
        };
        request.post(options, (error, result, resBody) => {
          if (error) reject(error);
          if (result.statusCode == '500') {
            throw new Error('ERROR 500: Internal server error')
          } else {
            var resbody = JSON.parse(result.body);
            resolve({result, resbody})
          }
        });
 });
}

static getResponse_request(url, token) {
  return new Promise ( (resolve, reject) => {

    const options = {
      headers: {
        'content-Type': 'application/json',
        'Authorization': `Token ${token}`

      },
      url: `${baseUrl}${url}`
    };
    request.get(options, (error, result, resBody) => {
      if (error) reject(error);
      var resbody = JSON.parse(result.body);
      resolve({result, resbody})
    });
});
};

static putResponse(query, url, token) {
  return new Promise ( (resolve, reject) => {
  
      const body = JSON.stringify(query);
      const options = {
        headers: {
          'content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        url: `${baseUrl}${url}`,
        body,
      };
      request.put(options, (error, result, resBody) => {
        if (error) reject(error);
        var resbody = JSON.parse(result.body);
        resolve({result, resbody})
      });
});
};

static postResponse(query, url) {
  return new Promise ( (resolve, reject) => {
  
      const body = JSON.stringify(query);
      const options = {
        headers: {
          'content-Type': 'application/json',
        },
        url: `${baseUrl}${url}`,
        body,
      };
      request.post(options, (error, result, resBody) => {
        if (error) reject(error);
        var resbody = JSON.parse(result.body);
        resolve({result, resbody})
      });
});
};

}

module.exports = Consumers
