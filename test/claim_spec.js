const assert = require('chai').assert,
      nock   = require('nock'),
      Client = require('../')

const { fixture_one } = require('./fixtures');

describe('Claim', () => {
  it('should send a request to the submitted url', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc')
    .reply(201, { result: 'success' });

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc'
    }
    client.claim(options, (err, res) => {
      assert.isNull(err);
      assert.equal(res.result, 'success');
    })
  });

  it('should add required text', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc?scan=test')
    .reply(201, { result: 'success' });

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text: 'test'
    }
    client.claim(options, (err, res) => {
      assert.isNull(err);
      assert.equal(res.result, 'success');
    })
  });

  it('should add forbidden text', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc?scan!=test')
    .reply(201, { result: 'success' });

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      forbidden_text: 'test'
    }
    client.claim(options, (err, res) => {
      assert.isNull(err);
      assert.equal(res.result, 'success');
    })
  });

  it('should add required and forbidden text', () => {
    nock('https://cert.trustedform.com')
    .post('/1234abc?scan=test1&scan!=test2')
    .reply(201, { result: 'success' });

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text: 'test1',
      forbidden_text: 'test2'
    }
    client.claim(options, (err, res) => {
      assert.isNull(err);
      assert.equal(res.result, 'success');
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