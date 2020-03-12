# TrustedForm API Client
This is a Node.js module for calling the TrustedForm API.

[![Build Status](https://travis-ci.com/activeprospect/trustedform-api-client.svg?branch=master)](https://travis-ci.org/activeprospect/trustedform-api-client)

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
| parameter | type    | required | description                             |
| --------- | ------- | -------- | --------------------------------------- |
| `cert_url`| String | Yes | The url of the certificate  to claim.        |
| `vendor`  | String | No | Value stored for grouping and sorting          |
| `required_text` | String OR Array  | No | Text TrustedForm can confirm is in the snapshot |
| `forbidden_text`  | String OR Array | No | Text TrustedForm can confirm is absent |
| `email`  | String | No | Email used for fingerprinting - see docs below |
| `phone_1`  | String | No | Phone used for fingerprinting - see docs below |
| `phone_2`  | String | No | Phone used for fingerprinting - see docs below |
| `phone_3`  | String | No | Phone used for fingerprinting - see docs below |

For a more in-depth view of these options and how they work, you can visit our support article [here](https://support.activeprospect.com/hc/en-us/articles/201325449).

### Node Version
This library supports Node version 8 and above. Other versions may work, but they are not currently a priority for the authors of this repository. 