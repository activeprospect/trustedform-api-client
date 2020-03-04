# TrustedForm API Client
This is a Node.js module for calling the TrustedForm API.

[![Build Status](https://travis-ci.org/activeprospect/trustedform-api-client.svg?branch=master)](https://travis-ci.org/activeprospect/trustedform-api-client)

### Client

To use SuppressionList, require this module and create a new Client instance using your API key.

```javascript
const Client = require('suppressionlist-api-client');

const apiKey = '123456';

const client = new Client(apiKey);

// now you can use the client
client.getLists((err, lists) => {
  if (err) throw err;
  console.log(lists);
});

```

### Client Functions

All functions take a callback that is invoked with two parameters:

* `err` &mdash; the error, if one occured, or null if one did not
* `results` &mdash; the results of the call. For calls that return multiple records, this is an `Array`. When fetching
                    a single record, this is a plain old `Object`, as returned by the SuppressionList API.

##### `getLists(callback)`

The `getLists()` function returns all the lists in your account. There is not currently a way to filter. SuppressionList
will always return all lists.

##### `createList(name, ttl, callback)`

The `createList()` function creates a new list in your account. The `name` is the human-readable name for the list.
The `ttl` is the "time to live" for records in that list, in seconds.

##### `ensureList(name, ttl, callback)`

The `ensureList()` function ensures that a list with the given `name` exists. If it does, it'll be returned without
modification. If it does not, then it'll be created and returned.