const assert = require('chai').assert;
const nock = require('nock');
const Client = require('../');

const apiResponse = {
  id: '123',
  created_at: '2020-03-05T17:42:34Z',
  masked_cert_url: 'https://cert.trustedform.com/a60da7d102720af6a6aa9a2085330a00402b038e',
  masked: false,
  expires_at: '2025-03-04T17:42:34Z',
  age: 69288,
  page_id: '5cf7fa6a257b85d6230041c9',
  warnings: [],
  reference: null,
  vendor: null,
  scans: {
    found: ['test'],
    not_found: ['blah']
  },
  fingerprints: {
    matching: [
      '456c6c7a59968bceccd208e9b9f4dde55b8e89f6',
      'd511850d569bcd7802c30f54de34bb9f2b31eede'
    ],
    non_matching: []
  },
  share_url: 'https://cert.trustedform.com/38ff5a59e61a5ad9b6b065065057e34e018f33ae?shared_token=YzNOUE1tZEdObmxJVWtRMlVHUkpaamM1YTFablYySmlkVlIwT1hneU56aHRTVkpwVEhWMGMwRkRjbEJWZEhwWVNXd3hVVTVDVEdkcGJURkdOSGhWT0d3eWRUWTJUVlp5YUhKMU9HVnVNRTEyYkd4bFYwTlZkR2xOYkZKblJGSkpkbk16VTA5aU4ycFRTbk05TFMwdk1UVkhlR1JYY0dScWJ6Sm5kM2xEYzBKUVZIUm5QVDA9LS02NjkwYTcxZmI0ZGNhZDY0NzFkM2IzMWE1OTliYmY0YjJmYTc1ZjE2',
  cert: {
    token: '38ff5a59e61a5ad9b6b065065057e34e018f33ae',
    created_at: '2020-03-04T22:26:34Z',
    ip: '76.210.191.62',
    parent_location: null,
    location: 'https://demo.activeprospect.com/franklin-pest-control/',
    framed: false,
    browser: 'Chrome 80.0.3987',
    operating_system: 'Mac OS X 10.15.1',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
    snapshot_url: 'https://cert.trustedform.com/38ff5a59e61a5ad9b6b065065057e34e018f33ae/snapshot/index.html',
    expires_at: '2020-03-07T22:26:34Z',
    geo: {
      lat: 30.3544,
      lon: -97.7344,
      city: 'Austin',
      state: 'TX',
      postal_code: '78757',
      country_code: 'US',
      time_zone: 'America/Chicago'
    },
    event_duration: 72412,
    claims: [
      {
        id: '5e602caa45191e3d22002cdc',
        created_at: '2020-03-04T22:33:14Z',
        masked_cert_url: 'https://cert.trustedform.com/49ce1a0c05241bbf8de08675604b63e451373ebf',
        masked: false,
        expires_at: '2025-03-03T22:33:14Z',
        age: 328,
        page_id: '5cf7fa6a257b85d6230041c9',
        warnings: [],
        reference: null,
        vendor: null,
        scans: null,
        fingerprints: {
          matching: [],
          non_matching: []
        },
        share_url: 'https://cert.trustedform.com/38ff5a59e61a5ad9b6b065065057e34e018f33ae?shared_token=WlU0d1ZXaHhlRzFoUVdsWlFub3JRMUJQVVhOeFZtdDBhekJ4Y1ZoaFRpc3dOMVZMVUdKUEt6UkJlVk5zTkM5aVdUTldMM2syZGpGQ1R6VlRUM1ZWU2xOQlFqVnpRMU5LZUhGTE1rc3dSRE5JYlc4MFRVcDJZM0kwYzJveGFERnFaRlJFY3paclRrbDVkbk05TFMxYVUxQnlUREl4TUZWRmIydGFPR293YTNSbVVtaG5QVDA9LS02MWZlNmMzMDkzOTg0ZWY1YWYxZTgwYmM4NDAwMTcxNGU1OGE0YTg0'
      }
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
      .post('/1234abc', 'scan%5B%5D=test&scan_delimiter=%7C')
      .reply(201, apiResponse);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      required_text: 'test',
      scan_delimiter: '|'
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
      .matchHeader('x-api-version', '42')
      .post('/1234abc')
      .reply(201, apiResponse);

    const client = new Client('asdf');
    const options = {
      cert_url: 'https://cert.trustedform.com/1234abc',
      headers: {
        'x-api-version': '42'
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
