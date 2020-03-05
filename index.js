const _ = require('lodash');
const request = require('request');

class TrustedFormError extends Error {
  constructor(message, statusCode, body) {
    super(message);
    this.statusCode = statusCode;
    this.body = body;
  }
}

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

  claim(uri, callback) {
    this._request({ uri }, (err, res, body) => {
      if (err) return callback(err);
      if (res.statusCode !== 200) {
        return callback(new TrustedFormError('Cound not claim form', res.statusCode, body));
      }
      callback(null, body);
    });
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