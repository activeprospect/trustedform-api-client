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
          'Authorization': `Basic ${Buffer.from(`X:${apiKey}`).toString('base64')}`
        }
      }
  }

  claim(options, callback) {
    let url = options.cert_url;
    let body = {};

    // ensure required and forbidden text are arrays
    if (options.required_text && !_.isArray(options.required_text)) {
      options.required_text = [ options.required_text ];
    }
    if (options.forbidden_text && !_.isArray(options.forbidden_text)) {
      options.forbidden_text = [ options.forbidden_text ];
    }

    for (const param in params) {
      if (options[param]) {
        body[params[param]] = options[param];
      }
    }
    body = qs.stringify(body);

    this._request({ url, body }, (err, res, body) => {
      if (err) return callback(err);
      if (res.statusCode !== 201) {
        return callback(new TrustedFormError('Could not claim form', res.statusCode, body));
      }
      callback(null, res, body);
    });
  }

  _request(options, callback) {
    const opts = {
      url: options.url,
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
