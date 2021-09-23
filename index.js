const _ = require('lodash');
const request = require('request');
const qs = require('querystring');

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
          'Authorization': `Basic ${Buffer.from(`X:${apiKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
  }

  claim(options, callback) {
    options.body = {};

    // ensure required and forbidden text are arrays
    if (options.required_text && !_.isArray(options.required_text)) {
      options.required_text = [ options.required_text ];
    }
    if (options.forbidden_text && !_.isArray(options.forbidden_text)) {
      options.forbidden_text = [ options.forbidden_text ];
    }

    for (const param in params) {
      if (options[param]) {
        options.body[params[param]] = options[param];
      }
    }
    options.body = qs.stringify(options.body);

    this._request(options, (err, res, body) => {
      if (err) return callback(err);
      if (res.statusCode !== 201) {
        return callback(new TrustedFormError('Could not claim form', res.statusCode, body), res, body);
      }
      callback(null, res, body);
    });
  }

  _request(options, callback) {
    const opts = {
      url: options.cert_url,
      method: 'POST',
      headers: _.merge({}, this.base.headers, options.headers),
      body: options.body
    };
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
      else {
        return callback(new TrustedFormError('Unrecognized response type', res.statusCode, body));
      }
      callback(null, res, body);
    });
  }
}

const params = {
  'required_text': 'scan[]',
  'forbidden_text': 'scan![]',
  'reference': 'reference',
  'vendor': 'vendor',
  'email': 'email',
  'phone_1': 'phone_1',
  'phone_2': 'phone_2',
  'phone_3': 'phone_3'
};

module.exports = Client;
