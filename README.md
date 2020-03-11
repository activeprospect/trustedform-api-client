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
client.claim(options, (err, res, body) => {
  if (err) throw err;
  console.log(body);
});

```

### Client Functions

All functions take a callback that is invoked with two parameters:

* `err` &mdash; the error, if one occured, or null if one did not
* `results` &mdash; the results of the call.

##### `claim(options, callback)`

The `claim()` function returns a JSON object containing the claim record

Options:
  - cert_url: string (required)
  - vendor: string
  - required text:  string OR array of strings
  - forbidden text: string OR array of strings
  - email: string
  - phone_1: string
  - phone_2: string
  - phone_3: string

### Node Version
This library supports Node version 8 and above. Other versions may work, but they are not currently a priority for the authors of this repo. 