# TrustedForm API Client
This is a Node.js module for calling the TrustedForm API.

[![Build Status](https://travis-ci.org/activeprospect/trustedform-api-client.svg?branch=master)](https://travis-ci.org/activeprospect/trustedform-api-client)

### Client

To use TrustedForm, require this module and create a new Client instance using your API key.

```javascript
const Client = require('trustedform-api-client');

const apiKey = '123456';

const client = new Client(apiKey);

// now you can use the client
client.claim((err, lists) => {
  if (err) throw err;
  console.log(lists);
});

```

### Client Functions

All functions take a callback that is invoked with two parameters:

* `err` &mdash; the error, if one occured, or null if one did not
* `results` &mdash; the results of the call.

##### `claim(options, ttl, callback)`

The `claim()` function returns a JSON object containing the claim record

Options:
  - cert_url (required)
  - vendor
  - required text
  - forbidden text
  - email
  - phone_1
  - phone_2
  - phone_3
