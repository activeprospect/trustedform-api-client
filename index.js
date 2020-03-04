const _ = require('lodash');
const request = require('request');

class Client {
  constructor() {
    let baseUrl;
    if (env === 'production')
      baseUrl = 'https://cert.trustedform.com';
    else if (env === 'staging')
      baseUrl = 'http://cert.staging.trustedform.com';
    else
      baseUrl = 'http://trustedform.dev';
    
      this.base = {
        url: baseUrl,
        headers: {
          'Accept': 'application/json'
        }
      }
  }

  claim() {
    // magic
  }

  _request(options, classback) {
    // request stuff
  }
}

module.exports = Client;