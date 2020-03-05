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
          'Authorization': `Basic ${new Buffer(`X:${apiKey}`).toString('base64')}`
        }
      }
  }

  claim(options, callback) { 
    const { cert_url, required_text, forbidden_text } = options;
    const url = new URL(cert_url);
    if (required_text)  url.searchParams.append('scan', required_text);
    if (forbidden_text) url.searchParams.append('scan!', forbidden_text);
    this._request({ url: url.href }, (err, res, body) => {
      if (err) return callback(err);
      if (res.statusCode !== 201) {
        return callback(new TrustedFormError('Cound not claim form', res.statusCode, body));
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

module.exports = Client;