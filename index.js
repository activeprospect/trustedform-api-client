const _ = require('lodash');
const request = require('request');
const qs = require('querystring');

class TrustedFormError extends Error {
  constructor (message, statusCode, body) {
    super(message);
    this.statusCode = statusCode;
    this.body = body;
  }
}

class Client {
  constructor (apiKey) {
    this.base = {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`X:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
  }

  claim (options, callback) {
    options.body = {};

    // ensure required and forbidden text are arrays
    if (options.required_text && !_.isArray(options.required_text)) {
      options.required_text = [options.required_text];
    }
    if (options.forbidden_text && !_.isArray(options.forbidden_text)) {
      options.forbidden_text = [options.forbidden_text];
    }

    const params = this._getParams(_.get(options.headers, 'api-version'));
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

  _request (options, callback) {
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
      } else {
        return callback(new TrustedFormError('Unrecognized response type', res.statusCode, body));
      }
      callback(null, res, body);
    });
  }

  _getParams (versionHeader) {
    if (versionHeader !== '3.0') return paramsV2;

    // TF V3 APi has different params for scan text
    return Object.assign(paramsV2, { required_text: 'required_scan_terms[]', forbidden_text: 'forbidden_scan_terms[]' });
  }
}

const paramsV2 = {
  required_text: 'scan[]',
  forbidden_text: 'scan![]',
  reference: 'reference',
  vendor: 'vendor',
  scan_delimiter: 'scan_delimiter',
  email: 'email',
  phone_1: 'phone_1',
  phone_2: 'phone_2',
  phone_3: 'phone_3'
};

module.exports = Client;
