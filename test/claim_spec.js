const assert = require('chai').assert;
const nock = require('nock');
const Client = require('../');

// "version 3.0" style response
const apiResponse = {
  fingerprints: {
    matching: [
      '456c6c7a59968bceccd208e9b9f4dde55b8e89f6',
      'd511850d569bcd7802c30f54de34bb9f2b31eede'
    ],
    non_matching: []
  },
  id: '123',
  masked_cert_url: 'https://cert.trustedform.com/4692b414d4f53be638549dc9d47c6399ac6666da',
  outcome: 'success',
  scans: {
    found: [
      'test'
    ],
    not_found: [
      'blah'
    ]
  }
};

describe('Claim', () => {
  it('should send a request to the submitted url', () => {
    nock('https://cert.trustedform.com')
      .matchHeader('Accept', 'application/json')
      .matchHeader('Authorization', 'Basic WDphc2Rm')
      .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
      .post('/1234abc')
      .reply(201, apiResponse);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc'
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.equal(body.id, '123');
    });
  });

  it('should add expected parameters to request', () => {
    nock('https://cert.trustedform.com')
      .post('/1234abc', 'scan%5B%5D=test')
      .reply(201, apiResponse);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text: 'test'
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.equal(body.scans.found, 'test');
    });
  });

  it('should not add wildcard parameters', () => {
    nock('https://cert.trustedform.com')
      .post('/1234abc', 'scan!%5B%5D=test')
      .reply(201, apiResponse);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      forbidden_text: 'test',
      username: ';select * from users'
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.equal(body.id, '123');
    });
  });

  it('should add multiple parameters', () => {
    nock('https://cert.trustedform.com')
      .post('/1234abc', 'scan%5B%5D=test&scan!%5B%5D=waldo')
      .reply(201, apiResponse);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text: 'test',
      forbidden_text: 'waldo'
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.equal(body.scans.found, 'test');
      assert.equal(body.scans.not_found, 'blah');
    });
  });

  it('should add specified headers', () => {
    nock('https://cert.trustedform.com')
      .matchHeader('api-version', '3.0')
      .post('/1234abc')
      .reply(201, apiResponse);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      headers: {
        'api-version': '3.0'
      }
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.equal(body.id, '123');
    });
  });

  it('should handle fingerprinting options', () => {
    nock('https://cert.trustedform.com')
      .post('/1234abc', 'email=test%40test.com&phone_1=123')
      .reply(201, apiResponse);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      email: 'test@test.com',
      phone_1: '123'
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.equal(body.fingerprints.matching.length, 2);
    });
  });

  it('should handle required text scan being an array', () => {
    nock('https://cert.trustedform.com')
      .post('/1234abc', 'scan%5B%5D=one&scan%5B%5D=two')
      .reply(201, apiResponse);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text: ['one', 'two']
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.equal(body.id, '123');
    });
  });

  it('should handle forbidden text scan being an array', () => {
    nock('https://cert.trustedform.com')
      .post('/1234abc', 'scan%5B%5D=one&scan!%5B%5D=two&scan!%5B%5D=three')
      .reply(201, apiResponse);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text: 'one',
      forbidden_text: ['two', 'three']
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.equal(body.id, '123');
    });
  });

  it('should handle an error', () => {
    nock('https://cert.trustedform.com')
      .post('/1234abc')
      .reply(403, { error: 'Invalid Authentication' });

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc'
    };
    client.claim(options, (err) => {
      assert.equal(err.statusCode, 403);
      assert.equal(err.message, 'Could not claim form');
      assert.equal(err.body.error, 'Invalid Authentication');
    });
  });

  it('should handle a non-json response', () => {
    nock('https://cert.trustedform.com')
      .post('/1234abc')
      .reply(500, '<html><body>Oops! Something went wrong.</body></html>');

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc'
    };
    client.claim(options, (err, res) => {
      assert.equal(err.statusCode, 500);
      assert.equal(err.message, 'Unrecognized response type');
    });
  });
});
