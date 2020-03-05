const assert = require('chai').assert,
      nock   = require('nock'),
      Client = require('../')

const { fixture_one } = require('./fixtures');

describe('Claim', () => {
  it('should send a request to the submitted url', () => {
    nock('https://cert.trustedform.com')
    .post('/')
    .reply(201, { result: 'success' });

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com'
    }
    client.claim(options, (err, res) => {
      assert.isNull(err);
      assert.equal(res.result, 'success');
    })
  })
})