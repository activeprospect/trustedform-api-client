const assert = require('chai').assert,
      nock   = require('nock'),
      Client = require('../')

const { basic_fixture,
        scan_fixture,
        scan_and_forbidden_fixture,
        fingerprint_fixture
      } = require('./fixtures');

describe('Claim', () => {
  it('should send a request to the submitted url', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc')
    .reply(201, basic_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc'
    }
    client.claim(options, (err, res) => {
      assert.isNull(err);
      assert.equal(res.id, '123');
    })
  });

  it('should add expected parameters to request', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc?scan[]=test')
    .reply(201, scan_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text: 'test'
    }
    client.claim(options, (err, res) => {
      assert.isNull(err);
      assert.equal(res.scans.found, 'test');
    })
  });

  it('should not add wildcard parameters', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc?scan![]=test')
    .reply(201, basic_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      forbidden_text: 'test',
      username: ';select * from users'
    }
    client.claim(options, (err, res) => {
      assert.isNull(err);
      assert.equal(res.id, '123');
    })
  });

  it('should add multiple parameters', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc?scan[]=test&scan![]=waldo')
    .reply(201, scan_and_forbidden_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text: 'test',
      forbidden_text: 'waldo'
    }
    client.claim(options, (err, res) => {
      assert.isNull(err);
      assert.equal(res.scans.found, 'test');
      assert.equal(res.scans.not_found, 'waldo');
    })
  });

  it('should handle fingerprinting options', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc?email=test%40test.com&phone_1=123')
    .reply(201, fingerprint_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      email: 'test@test.com',
      phone_1: '123'
    }
    client.claim(options, (err, res) => {
      assert.isNull(err);
      assert.exists(res.fingerprints.matching)
    })
  });

  it('should handle required text scan being an array', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc?scan[]=one&scan[]=two')
    .reply(201, scan_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text : ['one', 'two']
    }
    client.claim(options, (err, res) => {
      assert.isNull(err);
      assert.exists(res.fingerprints.matching)
    })
  });

  it('should handle forbidden text scan being an array', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc?scan[]=one&scan![]=two&scan![]=three')
    .reply(201, scan_fixture);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text : 'one',
      forbidden_text: ['two', 'three']
    }
    client.claim(options, (err, res) => {
      assert.isNull(err);
      assert.exists(res.fingerprints.matching)
    })
  });

  it('should handle an error', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc')
    .reply(403, { 'error': 'Invalid Authentication' });

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc'
    } 
    client.claim(options, (err, res) => {
      assert.equal(err.statusCode, 403);
      assert.equal(err.message, 'Could not claim form');
      assert.equal(err.body.error, 'Invalid Authentication');
    })
  });

  it('should handle a non-json response', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc')
    .reply(404, '<html><body>Oops! Something went wrong.</body></html>');

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc'
    } 
    client.claim(options, (err, res) => {
      assert.equal(err.statusCode, 404);
      assert.equal(err.message, 'Could not claim form');
    })
  })
})