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
  constructor(apiKey) {
      this.base = {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(`X:${apiKey}`).toString('base64')}`
        }
      }
  }

  claim(options, callback) { 
    let  url = options.cert_url;
    let queryString = '';

    for (const param in params) {
      if (options[param]) {
        queryString += `${params[param]}=${options[param]}&`;
      }
    }
    if (queryString !== '') url = `${url}?${queryString}`

    this._request({ url }, (err, res, body) => {
      if (err) return callback(err);
      if (res.statusCode !== 201) {
        return callback(new TrustedFormError('Could not claim form', res.statusCode, body));
      }
      callback(null, body);
    });
  }

  _request(options, callback) {
    const opts = {
      url: `${options.url}`,
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

const params = {
  'required_text': 'scan',
  'forbidden_text': 'scan!',
  'reference': 'reference',
  'vendor': 'vendor',
  'email': 'email',
  'phone_1': 'phone_1',
  'phone_2': 'phone_2',
  'phone_3': 'phone_3'
};

module.exports = Client;