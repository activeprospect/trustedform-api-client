const _ = require('lodash');
const request = require('request');

class Client {
  constructor(apiKey, env) {
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
          'Accept': 'application/json',
          'Authorization': `Basic ${new Buffer(`X:${apiKey}`).toString('base64')}`
        }
      }
  }

  claim() {
    // magic
  }

  _request(options, callback) {
    const opts = {
      url: `${this.base.url}${options.uri}`,
      method: 'POST',
      headers: _.merge({}, this.base.headers, options.headers)
    }

    request(opts, (err, res, body) => {
      if (err) return callback(err);
      const contentType = res.headers['content-type'];
      if (contentType && contentType.indexOf('json') > -1 && _.isString(body)) {
        try {
          body = JSON.parse(body);
        } catch (err) {
          return callback(err);
        }
      }
      callback(null, res, body);
    });
  }
}

module.exports = Client;