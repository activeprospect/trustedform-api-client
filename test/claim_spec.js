const assert = require('chai').assert,
      nock   = require('nock'),
      Client = require('../');

const { basic_fixture,
        scan_fixture,
        scan_and_forbidden_fixture,
        fingerprint_fixture
      } = require('./fixtures');

describe('Claim', () => {
  it('should send a request to the submitted url', () => {
    nock('https://cert.trustedform.com')
    .matchHeader('Accept', 'application/json')
    .matchHeader('Authorization', 'Basic WDphc2Rm')
    .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
    .post('/1234abc')
    .reply(201, basic_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc'
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.equal(body.id, '123');
    })
  });

  it('should add expected parameters to request', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc', 'scan%5B%5D=test')
    .reply(201, scan_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text: 'test'
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.equal(body.scans.found, 'test');
    })
  });

  it('should not add wildcard parameters', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc', 'scan!%5B%5D=test')
    .reply(201, basic_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      forbidden_text: 'test',
      username: ';select * from users'
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.equal(body.id, '123');
    })
  });

  it('should add multiple parameters', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc', 'scan%5B%5D=test&scan!%5B%5D=waldo')
    .reply(201, scan_and_forbidden_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text: 'test',
      forbidden_text: 'waldo'
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.equal(body.scans.found, 'test');
      assert.equal(body.scans.not_found, 'waldo');
    })
  });

  it('should handle fingerprinting options', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc', 'email=test%40test.com&phone_1=123')
    .reply(201, fingerprint_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      email: 'test@test.com',
      phone_1: '123'
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.exists(body.fingerprints.matching)
    })
  });

  it('should handle required text scan being an array', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc', 'scan%5B%5D=one&scan%5B%5D=two')
    .reply(201, scan_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text : ['one', 'two']
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.exists(body.fingerprints.matching)
    })
  });

  it('should handle forbidden text scan being an array', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc', 'scan%5B%5D=one&scan!%5B%5D=two&scan!%5B%5D=three')
    .reply(201, scan_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text : 'one',
      forbidden_text: ['two', 'three']
    };
    client.claim(options, (err, res, body) => {
      assert.isNull(err);
      assert.exists(body.fingerprints.matching)
    })
  });

  it('should handle an error', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc')
    .reply(403, { 'error': 'Invalid Authentication' });

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc'
    };
    client.claim(options, (err) => {
      assert.equal(err.statusCode, 403);
      assert.equal(err.message, 'Could not claim form');
      assert.equal(err.body.error, 'Invalid Authentication');
    })
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
    })
  })
});
